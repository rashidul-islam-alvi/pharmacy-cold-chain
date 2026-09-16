import { validateMedication } from "@/lib/rxnorm/validate";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const medication = body.medication?.trim();

    if (!medication) {
      return Response.json(
        {
          success: false,
          error: "Medication is required",
        },
        { status: 400 },
      );
    }

    const result = await validateMedication(medication);

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("RxNorm validation error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "RxNorm validation failed",
      },
      { status: 500 },
    );
  }
}
