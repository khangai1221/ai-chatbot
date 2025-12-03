import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const GET = async () => {
  try {
    const authenticated = await isAuthenticated();

    if (authenticated) {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }
};
