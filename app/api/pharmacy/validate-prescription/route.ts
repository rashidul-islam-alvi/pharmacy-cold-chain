import { validatePrescription } from "@/lib/pharmacy/validate-prescription";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const medicationRequestId = body.medicationRequestId?.trim();

    if (!medicationRequestId) {
      return Response.json(
        {
          success: false,
          error: "MedicationRequest ID is required",
        },
        { status: 400 },
      );
    }

    const result = await validatePrescription(medicationRequestId);

    return Response.json({
      success: true,
      message: "Prescription validated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Prescription validation error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Prescription validation failed",
      },
      { status: 500 },
    );
  }
}
