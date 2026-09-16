import { parsePharmacyOrder } from "@/lib/h17/parser";
import { validateMedication } from "@/lib/rxnorm/validate";

export async function processIndent(rawHL7: string) {
  // 1. Parse the incoming HL7 order
  const order = parsePharmacyOrder(rawHL7);

  // 2. Validate the medication against RxNorm
  const validation = await validateMedication(order.medication);

  // 3. Determine whether the medication can proceed
  const approved = validation.valid;

  return {
    order,
    validation,
    approved,
  };
}
