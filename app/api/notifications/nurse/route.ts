import { createNurseNotification } from "@/lib/notifications/nurse-notification";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const courier = body.courier?.trim();
    const etaMinutes = body.etaMinutes;

    if (!courier) {
      return Response.json(
        {
          success: false,
          error: "Courier is required",
        },
        { status: 400 },
      );
    }

    if (typeof etaMinutes !== "number" || etaMinutes <= 0) {
      return Response.json(
        {
          success: false,
          error: "ETA must be a positive number",
        },
        { status: 400 },
      );
    }

    const notification = createNurseNotification({
      courier,
      etaMinutes,
    });

    return Response.json({
      success: true,
      message: "PHI-safe nurse notification created",
      data: notification,
    });
  } catch (error) {
    console.error("Nurse notification error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create nurse notification",
      },
      { status: 500 },
    );
  }
}
