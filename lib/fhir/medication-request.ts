import { fhirGet } from "@/lib/fhir/client";

export const demoMedicationRequest = {
  resourceType: "MedicationRequest",

  status: "active",
  intent: "order",

  medicationCodeableConcept: {
    coding: [
      {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "309309",
        display: "Ceftriaxone 1 GM Injection",
      },
    ],
    text: "Ceftriaxone 1 g injection",
  },

  subject: {
    reference: "Patient/1000",
  },

  dosageInstruction: [
    {
      text: "Ceftriaxone 1 g IV every 24 hours",
    },
  ],

  authoredOn: "2026-09-16T10:00:00Z",
};

export type MedicationRequestResource = {
  resourceType: "MedicationRequest";
  id: string;
  status: string;
  intent: string;

  medicationCodeableConcept?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];

    text?: string;
  };

  subject?: {
    reference?: string;
  };

  dosageInstruction?: {
    text?: string;
  }[];
};

export async function getMedicationRequest(
  id: string,
): Promise<MedicationRequestResource> {
  return fhirGet<MedicationRequestResource>(`/MedicationRequest/${id}`);
}
