import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import { createUser, getUsers } from "@/lib/admin/users-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  return NextResponse.json({ ok: true, users: getUsers() });
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  try {
    const body = await req.json();
    const res = createUser({
      username: String(body.username ?? ""),
      name: String(body.name ?? ""),
      role: body.role === "admin" ? "admin" : "owner",
      password: String(body.password ?? ""),
    });
    if (!res.ok)
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true, user: res.user });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
}
