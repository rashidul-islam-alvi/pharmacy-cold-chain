import { processPharmacyOrder } from "@/lib/pharmacy/process-pharmacy-order";

export async function POST(request: Request) {
  try {
    const body = await request.text();

    if (!body.trim()) {
      return Response.json(
        {
          success: false,
          error: "HL7 message body is empty",
        },
        { status: 400 },
      );
    }

    const result = await processPharmacyOrder(body);

    return Response.json({
      success: true,
      message: result.approved
        ? "Pharmacy cold-chain workflow completed"
        : "Medication rejected",
      data: result,
    });
  } catch (error) {
    console.error("Pharmacy workflow error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Pharmacy workflow failed",
      },
      { status: 500 },
    );
  }
}
