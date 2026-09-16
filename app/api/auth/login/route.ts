import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/users";
import { COOKIE_NAME, createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = body?.username;
    const password = body?.password;

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Username and password are required",
        },
        { status: 400 },
      );
    }

    const user = authenticateUser(username, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      );
    }

    const session = await createSession(user);

    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request",
      },
      { status: 400 },
    );
  }
}
