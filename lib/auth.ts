import { cookies } from "next/headers";

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("admin_auth");
    return authCookie?.value === "true";
  } catch {
    return false;
  }
}
