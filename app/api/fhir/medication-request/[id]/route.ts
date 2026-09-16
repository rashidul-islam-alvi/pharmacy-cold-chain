import { getMedicationRequest } from "@/lib/fhir/medication-request";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "MedicationRequest ID is required",
        },
        { status: 400 },
      );
    }

    const medicationRequest = await getMedicationRequest(id);

    return Response.json({
      success: true,
      message: "MedicationRequest retrieved successfully",
      data: medicationRequest,
    });
  } catch (error) {
    console.error("FHIR MedicationRequest retrieval error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve MedicationRequest",
      },
      { status: 500 },
    );
  }
}
