import { fhirGet } from "./client";

type PatientResource = {
  resourceType: "Patient";
  id: string;

  identifier?: {
    system?: string;
    value?: string;
  }[];
};

type PatientBundle = {
  resourceType: "Bundle";

  entry?: {
    resource?: PatientResource;
  }[];
};

export async function findPatientByHospitalId(
  patientId: string,
): Promise<PatientResource> {
  const system = "http://hospital.example/patients";

  const bundle = await fhirGet<PatientBundle>(
    `/Patient?identifier=${encodeURIComponent(`${system}|${patientId}`)}`,
  );

  const patient = bundle.entry?.[0]?.resource;

  if (!patient) {
    throw new Error(`Patient not found for ID ${patientId}`);
  }

  return patient;
}
