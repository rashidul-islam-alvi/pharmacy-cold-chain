import { processIndent } from "@/lib/pharmacy/process-indent";

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

    const result = await processIndent(body);

    return Response.json({
      success: true,
      message: result.approved ? "Medication approved" : "Medication rejected",
      data: result,
    });
  } catch (error) {
    console.error("Pharmacy indent processing error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process pharmacy indent",
      },
      { status: 400 },
    );
  }
}
