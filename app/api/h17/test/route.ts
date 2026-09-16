import { parsePharmacyOrder } from "@/lib/h17/parser";

export async function GET() {
  return Response.json({
    success: true,
    message: "HL7 endpoint is alive. Use POST to send an HL7 message.",
  });
}

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

    const order = parsePharmacyOrder(body);

    return Response.json({
      success: true,
      message: "HL7 OMP^O09 parsed successfully",
      data: order,
    });
  } catch (error) {
    console.error("HL7 parsing error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown HL7 parsing error",
      },
      { status: 400 },
    );
  }
}
