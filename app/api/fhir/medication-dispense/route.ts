import { saveMedicationDispense } from "@/lib/fhir/medication-dispense";

export async function POST(request: Request) {
  try {
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

    if (typeof etaMinutes !== "number" || etaMinutes <= 0) {
      return Response.json(
        {
          success: false,
          error: "ETA must be a positive number",
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
    console.error("FHIR MedicationDispense creation error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create MedicationDispense",
      },
      { status: 500 },
    );
  }
}
