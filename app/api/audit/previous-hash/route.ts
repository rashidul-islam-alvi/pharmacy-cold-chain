import { getPreviousAuditHash } from "@/lib/audit/hash-chain";
import { requireRole } from "@/lib/auth/session";

export async function GET() {
  try {
    // Audit-chain information is restricted to administrators.
    await requireRole(["ADMIN"]);

    const previousHash = await getPreviousAuditHash();

    return Response.json({
      success: true,
      previousHash: previousHash ?? null,
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
          error: "You are not authorized to access audit information",
        },
        { status: 403 },
      );
    }

    console.error("Previous audit hash error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to retrieve previous audit hash",
      },
      { status: 500 },
    );
  }
}
