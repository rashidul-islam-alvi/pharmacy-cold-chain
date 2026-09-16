const FHIR_BASE_URL = process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir";

export async function fhirGet<T>(path: string): Promise<T> {
  const response = await fetch(`${FHIR_BASE_URL}${path}`, {
    headers: {
      Accept: "application/fhir+json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`FHIR GET failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function fhirPost<T>(path: string, resource: unknown): Promise<T> {
  const response = await fetch(`${FHIR_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/fhir+json",
      "Content-Type": "application/fhir+json",
    },
    body: JSON.stringify(resource),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`FHIR POST failed (${response.status}): ${errorText}`);
  }

  return response.json();
}
