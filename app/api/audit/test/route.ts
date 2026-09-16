import { createAuditEvent, saveAuditEvent } from "@/lib/audit/audit-event";
import { getPreviousAuditHash } from "@/lib/audit/hash-chain";

export async function POST() {
  try {
    const previousHash = await getPreviousAuditHash();

    const event = createAuditEvent({
      action: "COURIER_ASSIGNED",
      outcome: "success",
      patientId: "P001",
      medicationRequestId: "1001",
      details: "Courier assigned for medication delivery",
      previousHash,
    });

    const savedEvent = await saveAuditEvent(event);

    return Response.json({
      success: true,
      message: "Chained AuditEvent created successfully",
      data: savedEvent,
    });
  } catch (error) {
    console.error("AuditEvent creation error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create AuditEvent",
      },
      { status: 500 },
    );
  }
}
