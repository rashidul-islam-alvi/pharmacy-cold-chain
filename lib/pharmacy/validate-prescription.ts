import { getMedicationRequest } from "@/lib/fhir/medication-request";
import { validateMedication } from "@/lib/rxnorm/validate";

export async function validatePrescription(medicationRequestId: string) {
  // 1. Read prescription from FHIR
  const prescription = await getMedicationRequest(medicationRequestId);

  const medication = prescription.medicationCodeableConcept?.text;

  if (!medication) {
    throw new Error("MedicationRequest does not contain a medication");
  }

  // 2. Validate medication with RxNorm
  const validation = await validateMedication(medication);

  return {
    medicationRequestId,
    medication,
    validation,
  };
}
