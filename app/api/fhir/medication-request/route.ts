import { fhirPost } from "@/lib/fhir/client";
import { demoMedicationRequest } from "@/lib/fhir/medication-request";
import { requireRole } from "@/lib/auth/session";

export async function POST() {
  try {
    // Creating a MedicationRequest is an admin-only operation.
    await requireRole(["ADMIN"]);

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
          error: "You are not authorized to create a MedicationRequest",
        },
        { status: 403 },
      );
    }

    console.error("FHIR MedicationRequest creation error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to create MedicationRequest",
      },
      { status: 500 },
    );
  }
}
