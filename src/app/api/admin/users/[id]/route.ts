import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/admin/route-guard";
import {
  deleteUser,
  updateUser,
  getUserById,
  parseRole,
  cleanSections,
  cleanCategoryScope,
  type AdminSection,
} from "@/lib/admin/users-store";
import { accessFromRequest } from "@/lib/admin/access";
import { isOwnerLike } from "@/lib/admin/users-store";

export const runtime = "nodejs";

function canManageUsers(req: Request): boolean {
  const a = accessFromRequest(req);
  if (!a) return false;
  if (isOwnerLike(a.role)) return true;
  return a.sections.includes("users");
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const caller = accessFromRequest(req);
  if (!caller || !canManageUsers(req)) return unauthorizedResponse();
  try {
    const target = getUserById(params.id);
    if (!target)
      return NextResponse.json(
        { ok: false, error: "User not found." },
        { status: 404 }
      );
    // Non-owners cannot edit owner rows or change roles to owner.
    const body = await req.json();
    const wantsOwner =
      body.role !== undefined && parseRole(body.role) === "owner";
    if (
      !isOwnerLike(caller.role) &&
      (isOwnerLike(target.role) || wantsOwner)
    ) {
      return NextResponse.json(
        { ok: false, error: "Only an Owner can edit Owner accounts/roles." },
        { status: 403 }
      );
    }
    const res = updateUser(params.id, {
      username:
        body.username !== undefined ? String(body.username) : undefined,
      name: body.name !== undefined ? String(body.name) : undefined,
      role:
        body.role === "owner" || body.role === "admin" || body.role === "manager"
          ? parseRole(body.role)
          : undefined,
      password: body.password !== undefined ? String(body.password) : undefined,
      sectionsChanged: body.sections !== undefined,
      sections:
        body.sections !== undefined
          ? (cleanSections(body.sections) as AdminSection[])
          : undefined,
      categoryScope:
        body.categoryScope !== undefined
          ? cleanCategoryScope(body.categoryScope)
          : undefined,
    });
    if (!res.ok)
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true, user: res.user });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const caller = accessFromRequest(req);
  if (!caller || !canManageUsers(req)) return unauthorizedResponse();
  const target = getUserById(params.id);
  if (target && isOwnerLike(target.role) && !isOwnerLike(caller.role))
    return NextResponse.json(
      { ok: false, error: "Only an Owner can delete Owner accounts." },
      { status: 403 }
    );
  const res = deleteUser(params.id);
  if (!res.ok)
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
