import { fhirPost } from "@/lib/fhir/client";
import { demoMedicationRequest } from "@/lib/fhir/medication-request";

export async function POST() {
  try {
    const medicationRequest = await fhirPost(
      "/MedicationRequest",
      demoMedicationRequest,
    );

    return Response.json({
      success: true,
      message: "Demo MedicationRequest created successfully",
      data: medicationRequest,
    });
  } catch (error) {
    console.error("FHIR MedicationRequest creation error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create MedicationRequest",
      },
      { status: 500 },
    );
  }
}
