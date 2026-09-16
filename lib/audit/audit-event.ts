import { createHash } from "crypto";
import { fhirPost } from "@/lib/fhir/client";

export type AuditAction =
  | "INDENT_RECEIVED"
  | "PRESCRIPTION_READ"
  | "RXNORM_VALIDATED"
  | "MEDICATION_APPROVED"
  | "MEDICATION_REJECTED"
  | "MEDICATION_PACKED"
  | "COURIER_ASSIGNED"
  | "MEDICATION_DISPATCHED"
  | "NOTIFICATION_SENT";

export function createAuditEvent({
  action,
  outcome,
  patientId,
  medicationRequestId,
  details,
  previousHash,
}: {
  action: AuditAction;
  outcome: "success" | "failure";
  patientId?: string;
  medicationRequestId?: string;
  details?: string;
  previousHash?: string;
}) {
  const recorded = new Date().toISOString();

  const auditData = {
    action,
    outcome,
    patientId,
    medicationRequestId,
    details,
    recorded,
    previousHash: previousHash ?? null,
  };

  const hash = createHash("sha256")
    .update(JSON.stringify(auditData))
    .digest("hex");

  return {
    resourceType: "AuditEvent",

    type: {
      system: "http://terminology.hl7.org/CodeSystem/audit-event-type",
      code: "rest",
      display: "RESTful Operation",
    },

    action: "E",

    recorded,

    outcome: outcome === "success" ? "0" : "4",

    agent: [
      {
        requestor: true,
        type: {
          text: "Pharmacy System",
        },
      },
    ],

    source: {
      observer: {
        display: "Pharmacy Cold Chain System",
      },
    },

    entity: [
      ...(patientId
        ? [
            {
              what: {
                identifier: {
                  system: "http://hospital.example/patients",
                  value: patientId,
                },
              },
            },
          ]
        : []),

      ...(medicationRequestId
        ? [
            {
              what: {
                reference: `MedicationRequest/${medicationRequestId}`,
              },
            },
          ]
        : []),
    ],

    extension: [
      {
        url: "http://example.org/fhir/StructureDefinition/audit-action",
        valueString: action,
      },
      {
        url: "http://example.org/fhir/StructureDefinition/audit-details",
        valueString: details ?? "",
      },
      {
        url: "http://example.org/fhir/StructureDefinition/previous-hash",
        valueString: previousHash ?? "",
      },
      {
        url: "http://example.org/fhir/StructureDefinition/event-hash",
        valueString: hash,
      },
    ],
  };
}

export async function saveAuditEvent(
  event: ReturnType<typeof createAuditEvent>,
) {
  return fhirPost("/AuditEvent", event);
}
