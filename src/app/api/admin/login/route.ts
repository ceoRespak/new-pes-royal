import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  issueSessionToken,
} from "@/lib/admin/session";
import { isMasterLogin, verifyUser } from "@/lib/admin/users-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body?.username ?? "admin").trim();
    const password = String(body?.password ?? "");

    let userId: string | null = null;

    // 1) stored admin users (created via Admin → Users)
    const stored = verifyUser(username, password);
    if (stored) {
      userId = stored.id;
    } else if (isMasterLogin(username, password)) {
      // 2) env master owner (username `admin` + ADMIN_PASSWORD)
      userId = "env-admin";
    }

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Incorrect username or password." },
        { status: 401 }
      );
    }

    const token = issueSessionToken(userId);
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
