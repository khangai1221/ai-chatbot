import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-change-this"
);

export interface UserJWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function signJWT(
  payload: Omit<UserJWTPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<UserJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserJWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
