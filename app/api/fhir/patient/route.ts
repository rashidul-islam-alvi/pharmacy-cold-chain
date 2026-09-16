import { fhirPost } from "@/lib/fhir/client";
import { demoPatient } from "@/lib/fhir/patient";

export async function POST() {
  try {
    const patient = await fhirPost("/Patient", demoPatient);

    return Response.json({
      success: true,
      message: "Demo Patient created successfully",
      data: patient,
    });
  } catch (error) {
    console.error("FHIR Patient creation error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create Patient",
      },
      { status: 500 },
    );
  }
}
