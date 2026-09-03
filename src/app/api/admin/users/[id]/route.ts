import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import { deleteUser, updateUser } from "@/lib/admin/users-store";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  try {
    const body = await req.json();
    const res = updateUser(params.id, {
      username:
        body.username !== undefined ? String(body.username) : undefined,
      name: body.name !== undefined ? String(body.name) : undefined,
      role:
        body.role === "owner" || body.role === "admin" ? body.role : undefined,
      password: body.password !== undefined ? String(body.password) : undefined,
    });
    if (!res.ok)
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true, user: res.user });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(_req)) return unauthorizedResponse();
  const res = deleteUser(params.id);
  if (!res.ok)
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
