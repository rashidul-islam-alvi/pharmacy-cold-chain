import { saveMedicationDispense } from "@/lib/fhir/medication-dispense";
import { requireRole } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    // MedicationDispense creation is an admin-only operation.
    await requireRole(["ADMIN"]);

    const body = await request.json();

    const { medicationRequestId, medicationName, rxCui, courier, etaMinutes } =
      body;

    if (!medicationRequestId) {
      return Response.json(
        {
          success: false,
          error: "MedicationRequest ID is required",
        },
        { status: 400 },
      );
    }

    if (!medicationName) {
      return Response.json(
        {
          success: false,
          error: "Medication name is required",
        },
        { status: 400 },
      );
    }

    if (!rxCui) {
      return Response.json(
        {
          success: false,
          error: "RxNorm CUI is required",
        },
        { status: 400 },
      );
    }

    if (!courier) {
      return Response.json(
        {
          success: false,
          error: "Courier is required",
        },
        { status: 400 },
      );
    }

    if (
      typeof etaMinutes !== "number" ||
      !Number.isFinite(etaMinutes) ||
      etaMinutes <= 0
    ) {
      return Response.json(
        {
          success: false,
          error: "ETA must be a positive finite number",
        },
        { status: 400 },
      );
    }

    const dispense = await saveMedicationDispense({
      medicationRequestId,
      medicationName,
      rxCui,
      courier,
      etaMinutes,
    });

    return Response.json({
      success: true,
      message: "MedicationDispense created successfully",
      data: dispense,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return Response.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return Response.json(
        {
          success: false,
          error: "You are not authorized to create a MedicationDispense",
        },
        { status: 403 },
      );
    }

    console.error("FHIR MedicationDispense creation error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to create MedicationDispense",
      },
      { status: 500 },
    );
  }
}
