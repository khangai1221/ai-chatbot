import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";
// cookies helper not needed here; we set cookies on the NextResponse

export const POST = async (req: NextRequest) => {
  try {
    const { email: rawEmail, password } = await req.json();
    const email = String(rawEmail || "")
      .trim()
      .toLowerCase();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    // create JWT token
    const token = await signJWT({ userId: user.id, email: user.email });

    // set cookie with JWT token
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
    });
    res.cookies.set({
      name: "user_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
};
