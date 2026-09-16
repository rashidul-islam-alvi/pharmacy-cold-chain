import { fhirPost } from "./client";

export function createMedicationDispense({
  medicationRequestId,
  medicationName,
  rxCui,
  courier,
  etaMinutes,
}: {
  medicationRequestId: string;
  medicationName: string;
  rxCui: string;
  courier: string;
  etaMinutes: number;
}) {
  return {
    resourceType: "MedicationDispense",

    status: "preparation",

    medicationCodeableConcept: {
      coding: [
        {
          system: "http://www.nlm.nih.gov/research/umls/rxnorm",
          code: rxCui,
          display: medicationName,
        },
      ],
      text: medicationName,
    },

    authorizingPrescription: [
      {
        reference: `MedicationRequest/${medicationRequestId}`,
      },
    ],

    quantity: {
      value: 1,
      unit: "package",
    },

    whenPrepared: new Date().toISOString(),

    extension: [
      {
        url: "http://example.org/fhir/StructureDefinition/courier",
        valueString: courier,
      },
      {
        url: "http://example.org/fhir/StructureDefinition/eta-minutes",
        valueInteger: etaMinutes,
      },
    ],
  };
}

export async function saveMedicationDispense({
  medicationRequestId,
  medicationName,
  rxCui,
  courier,
  etaMinutes,
}: {
  medicationRequestId: string;
  medicationName: string;
  rxCui: string;
  courier: string;
  etaMinutes: number;
}) {
  const dispense = createMedicationDispense({
    medicationRequestId,
    medicationName,
    rxCui,
    courier,
    etaMinutes,
  });

  return fhirPost("/MedicationDispense", dispense);
}
