import { fhirGet } from "@/lib/fhir/client";

type AuditEvent = {
  extension?: {
    url?: string;
    valueString?: string;
  }[];
};

type AuditEventBundle = {
  entry?: {
    resource?: AuditEvent;
  }[];
};

const EVENT_HASH_URL = "http://example.org/fhir/StructureDefinition/event-hash";

export async function getPreviousAuditHash(): Promise<string | undefined> {
  const bundle = await fhirGet<AuditEventBundle>(
    "/AuditEvent?_sort=-date&_count=1",
  );

  const latestEvent = bundle.entry?.[0]?.resource;

  if (!latestEvent?.extension) {
    return undefined;
  }

  const hashExtension = latestEvent.extension.find(
    (extension) => extension.url === EVENT_HASH_URL,
  );

  return hashExtension?.valueString;
}
