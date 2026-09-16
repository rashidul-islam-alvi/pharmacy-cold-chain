import { fhirGet } from "@/lib/fhir/client";

type MedicationRequestBundle = {
  resourceType: "Bundle";
  entry?: {
    resource?: MedicationRequestResource;
  }[];
};

export const demoMedicationRequest = {
  resourceType: "MedicationRequest",

  identifier: [
    {
      system: "http://hospital.example/orders",
      value: "ORD001",
    },
  ],

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

  identifier?: {
    system?: string;
    value?: string;
  }[];

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

export async function findMedicationRequestByOrderId(
  orderId: string,
): Promise<MedicationRequestResource> {
  const system = "http://hospital.example/orders";

  const bundle = await fhirGet<MedicationRequestBundle>(
    `/MedicationRequest?identifier=${encodeURIComponent(
      `${system}|${orderId}`,
    )}`,
  );

  const medicationRequest = bundle.entry?.[0]?.resource;

  if (!medicationRequest) {
    throw new Error(`MedicationRequest not found for order ${orderId}`);
  }

  return medicationRequest;
}
