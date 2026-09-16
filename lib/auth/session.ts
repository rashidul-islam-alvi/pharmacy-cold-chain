import { SignJWT, jwtVerify } from "jose";
import type { AuthUser, UserRole } from "./users";
import { cookies } from "next/headers";

const COOKIE_NAME = "pharmacy_session";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured");
}

const secretKey = new TextEncoder().encode(secret);

export async function createSession(user: AuthUser) {
  return new SignJWT({
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      typeof payload.username !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "NURSE")
    ) {
      return null;
    }

    return {
      username: payload.username,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
