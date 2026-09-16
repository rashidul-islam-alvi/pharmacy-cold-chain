import { parsePharmacyOrder } from "@/lib/h17/parser";
import { validateMedication } from "@/lib/rxnorm/validate";
import { getMedicationRequest } from "@/lib/fhir/medication-request";
import { saveMedicationDispense } from "@/lib/fhir/medication-dispense";
import { createNurseNotification } from "@/lib/notifications/nurse-notification";
import { createAuditEvent, saveAuditEvent } from "@/lib/audit/audit-event";
import { getPreviousAuditHash } from "@/lib/audit/hash-chain";

export async function processPharmacyOrder(rawHL7: string) {
  // 1. Parse HL7 indent
  const order = parsePharmacyOrder(rawHL7);

  // 2. Read the doctor's prescription
  const medicationRequest = await getMedicationRequest("1001");

  const prescribedMedication =
    medicationRequest.medicationCodeableConcept?.text;

  if (!prescribedMedication) {
    throw new Error("MedicationRequest does not contain a medication");
  }

  // 3. Validate the requested medication
  const validation = await validateMedication(order.medication);

  if (!validation.valid) {
    return {
      approved: false,
      order,
      prescribedMedication,
      validation,
    };
  }

  // 4. Create MedicationDispense
  const dispense = await saveMedicationDispense({
    medicationRequestId: medicationRequest.id,
    medicationName: validation.name!,
    rxCui: validation.rxcui!,
    courier: "Rahim",
    etaMinutes: 15,
  });

  // 5. Create PHI-safe notification
  const notification = createNurseNotification({
    courier: "Rahim",
    etaMinutes: 15,
  });

  // 6. Audit the completed workflow
  let previousHash = await getPreviousAuditHash();

  const audit = createAuditEvent({
    action: "MEDICATION_DISPATCHED",
    outcome: "success",
    patientId: order.patientId,
    medicationRequestId: medicationRequest.id,
    details: "Medication approved, dispensed, and assigned to courier",
    previousHash,
  });

  const savedAudit = await saveAuditEvent(audit);

  return {
    approved: true,
    order,
    prescribedMedication,
    validation,
    dispense,
    notification,
    audit: savedAudit,
  };
}
