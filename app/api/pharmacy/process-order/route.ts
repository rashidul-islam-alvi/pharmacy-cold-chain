import { processPharmacyOrder } from "@/lib/pharmacy/process-pharmacy-order";
import { requireRole } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    // Require authentication for all endpoints
    await requireRole(["ADMIN", "NURSE"]);

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
          error: "You are not authorized to perform this action",
        },
        { status: 403 },
      );
    }

    console.error("Pharmacy workflow error:", error);

    return Response.json(
      {
        success: false,
        error: "Pharmacy workflow failed",
      },
      { status: 500 },
    );
  }
}
