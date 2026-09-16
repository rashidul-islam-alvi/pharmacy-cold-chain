import { searchRxNorm } from "@/lib/rxnorm/client";

export async function GET() {
  try {
    const result = await searchRxNorm("Ceftriaxone 1 g injection");

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("RxNorm error:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "RxNorm request failed",
      },
      { status: 500 },
    );
  }
}
