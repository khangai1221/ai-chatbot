import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifyJWT } from "./jwt";

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie?.value) return false;

    // verify JWT token
    const payload = await verifyJWT(sessionCookie.value);
    return !!payload?.userId;
  } catch {
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie?.value) return null;

    // verify JWT token
    const payload = await verifyJWT(sessionCookie.value);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
