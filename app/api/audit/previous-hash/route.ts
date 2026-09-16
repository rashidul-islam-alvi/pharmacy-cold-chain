import { getPreviousAuditHash } from "@/lib/audit/hash-chain";

export async function GET() {
  try {
    const previousHash = await getPreviousAuditHash();

    return Response.json({
      success: true,
      previousHash: previousHash ?? null,
    });
  } catch (error) {
    console.error("Previous audit hash error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve previous audit hash",
      },
      { status: 500 },
    );
  }
}
