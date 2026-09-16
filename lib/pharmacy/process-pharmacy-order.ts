import { parsePharmacyOrder } from "@/lib/h17/parser";
import { validateMedication } from "@/lib/rxnorm/validate";
import { findMedicationRequestByOrderId } from "@/lib/fhir/medication-request";
import { findPatientByHospitalId } from "@/lib/fhir/patient";
import { saveMedicationDispense } from "@/lib/fhir/medication-dispense";
import { createNurseNotification } from "@/lib/notifications/nurse-notification";
import { createAuditEvent, saveAuditEvent } from "@/lib/audit/audit-event";
import { getPreviousAuditHash } from "@/lib/audit/hash-chain";

export async function processPharmacyOrder(rawHL7: string) {
  // 1. Parse HL7 indent
  const order = parsePharmacyOrder(rawHL7);

  // 2. Find the doctor's prescription
  // using the order ID from the HL7 message.
  const medicationRequest = await findMedicationRequestByOrderId(order.orderId);

  const prescribedMedication =
    medicationRequest.medicationCodeableConcept?.text;

  if (!prescribedMedication) {
    throw new Error("MedicationRequest does not contain a medication");
  }

  // 3. Find the patient from the prescription.
  let patient;

  try {
    patient = await findPatientByHospitalId(order.patientId);
  } catch {
    return {
      approved: false,
      order,
      prescribedMedication,
      validation: {
        valid: false,
        input: order.medication,
        rxcui: null,
        name: null,
        source: null,
      },
      reason: "Patient from HL7 order was not found",
    };
  }

  const prescriptionPatient = medicationRequest.subject?.reference;

  if (prescriptionPatient !== `Patient/${patient.id}`) {
    return {
      approved: false,
      order,
      prescribedMedication,
      validation: {
        valid: false,
        input: order.medication,
        rxcui: null,
        name: null,
        source: null,
      },
      reason: "HL7 patient does not match the MedicationRequest patient",
    };
  }

  // 5. Validate the medication prescribed
  // by the doctor using RxNorm.
  const prescribedValidation = await validateMedication(prescribedMedication);

  if (!prescribedValidation.valid) {
    return {
      approved: false,
      order,
      prescribedMedication,
      validation: prescribedValidation,
      reason: "Prescribed medication could not be validated against RxNorm",
    };
  }

  // 6. Validate the medication requested
  // by the HL7 pharmacy order.
  const requestedValidation = await validateMedication(order.medication);

  if (!requestedValidation.valid) {
    return {
      approved: false,
      order,
      prescribedMedication,
      validation: requestedValidation,
      reason: "Requested medication could not be validated against RxNorm",
    };
  }

  // 7. Compare the normalized RxNorm identities.
  // The medication requested by the pharmacy order
  // must match the medication prescribed by the doctor.
  if (requestedValidation.rxcui !== prescribedValidation.rxcui) {
    return {
      approved: false,
      order,
      prescribedMedication,
      validation: requestedValidation,
      reason: "Requested medication does not match the prescribed medication",
    };
  }

  // 8. Create MedicationDispense only after
  // all identity and medication checks pass.
  const dispense = await saveMedicationDispense({
    medicationRequestId: medicationRequest.id,

    medicationName: prescribedValidation.name!,

    rxCui: prescribedValidation.rxcui!,

    courier: "Rahim",

    etaMinutes: 15,
  });

  // 9. Create PHI-safe nurse notification.
  const notification = createNurseNotification({
    courier: "Rahim",
    etaMinutes: 15,
  });

  // 10. Get the previous audit hash.
  const previousHash = await getPreviousAuditHash();

  // 11. Record the completed workflow.
  const audit = createAuditEvent({
    action: "MEDICATION_DISPATCHED",

    outcome: "success",

    patientId: order.patientId,

    medicationRequestId: medicationRequest.id,

    details: "Medication approved, dispensed, and assigned to courier",

    previousHash,
  });

  const savedAudit = await saveAuditEvent(audit);

  // 12. Return the completed workflow.
  return {
    approved: true,
    order,
    prescribedMedication,
    validation: requestedValidation,
    dispense,
    notification,
    audit: savedAudit,
  };
}
