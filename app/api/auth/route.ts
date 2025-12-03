import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Simple password-based authentication
// In production, use proper hashing and secure password storage
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export const POST = async (req: NextRequest) => {
  try {
    const { password } = await req.json();

    if (password === ADMIN_PASSWORD) {
      // Set authentication cookie
      const cookieStore = await cookies();
      cookieStore.set("admin_auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
};

export const DELETE = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_auth");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
};
