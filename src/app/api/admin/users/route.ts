import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/admin/route-guard";
import {
  createUser,
  getUsers,
  parseRole,
  cleanSections,
  cleanCategoryScope,
  type AdminSection,
} from "@/lib/admin/users-store";
import { accessFromRequest } from "@/lib/admin/access";
import { isOwnerLike } from "@/lib/admin/users-store";

export const runtime = "nodejs";

/** Only accounts that can open the Admin Users section may manage users. */
function canManageUsers(req: Request): boolean {
  const a = accessFromRequest(req);
  if (!a) return false;
  if (isOwnerLike(a.role)) return true;
  return a.sections.includes("users");
}

export async function GET(req: Request) {
  if (!canManageUsers(req)) return unauthorizedResponse();
  return NextResponse.json({ ok: true, users: getUsers() });
}

export async function POST(req: Request) {
  const caller = accessFromRequest(req);
  if (!caller || !canManageUsers(req)) return unauthorizedResponse();
  try {
    const body = await req.json();
    const role = parseRole(body.role);
    // Only an owner may create an owner account.
    if (role === "owner" && !isOwnerLike(caller.role))
      return NextResponse.json(
        { ok: false, error: "Only an Owner can create Owner accounts." },
        { status: 403 }
      );
    const res = createUser({
      username: String(body.username ?? ""),
      name: String(body.name ?? ""),
      role,
      password: String(body.password ?? ""),
      sections: cleanSections(body.sections) as AdminSection[],
      categoryScope: cleanCategoryScope(body.categoryScope),
    });
    if (!res.ok)
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true, user: res.user });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
}
