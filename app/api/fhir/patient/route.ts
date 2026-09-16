import { fhirPost } from "@/lib/fhir/client";
import { demoPatient } from "@/lib/fhir/patient";
import { requireRole } from "@/lib/auth/session";

export async function POST() {
  try {
    // Patient creation is an admin-only operation.
    await requireRole(["ADMIN"]);

    const patient = await fhirPost("/Patient", demoPatient);

    return Response.json({
      success: true,
      message: "Demo Patient created successfully",
      data: patient,
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
          error: "You are not authorized to create a Patient",
        },
        { status: 403 },
      );
    }

    console.error("FHIR Patient creation error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to create Patient",
      },
      { status: 500 },
    );
  }
}
