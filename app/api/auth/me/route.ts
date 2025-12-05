import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get("user_session");
    const token = cookie?.value;
    if (!token)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // verify JWT token
    const payload = await verifyJWT(token);
    if (!payload?.userId)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("/api/auth/me error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
