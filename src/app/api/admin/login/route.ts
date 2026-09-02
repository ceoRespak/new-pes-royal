import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkLocalPassword,
  issueSessionToken,
} from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = String(body?.password ?? "");
    if (!checkLocalPassword(password)) {
      return NextResponse.json(
        { ok: false, error: "Incorrect password." },
        { status: 401 }
      );
    }
    const token = issueSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad request." },
      { status: 400 }
    );
  }
}
