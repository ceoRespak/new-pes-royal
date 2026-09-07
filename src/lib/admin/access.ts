import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  getSessionUserId,
  readSessionCookie,
  validateSession,
} from "./session";
import {
  ADMIN_SECTIONS,
  getUserById,
  isOwnerLike,
  type AdminSection,
  type AdminRole,
} from "./users-store";

/**
 * Access descriptor for the currently signed-in admin.
 *
 * The master env login (`admin` + ADMIN_PASSWORD) behaves as an owner with
 * every section and every category. Stored users resolve to their own row's
 * role + section + category scope.
 */
export interface AdminAccess {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  /** True for the env master owner login (not stored in /.data/users). */
  isMaster: boolean;
  sections: AdminSection[];
  /** null = every product category is allowed. */
  categoryScope: string[] | null;
}

function ownerLike(over: Partial<AdminAccess> = {}): AdminAccess {
  return {
    id: "env-admin",
    username: "admin",
    name: "Owner (Master)",
    role: "owner",
    isMaster: true,
    sections: [...ADMIN_SECTIONS],
    categoryScope: null,
    ...over,
  };
}

/** Resolve an access descriptor from a session token (or null). */
export function accessFromToken(
  token: string | null | undefined
): AdminAccess | null {
  if (!token || !validateSession(token)) return null;
  const userId = getSessionUserId(token);
  if (!userId) return ownerLike(); // legacy token → treat as master owner
  if (userId === "env-admin") return ownerLike();

  const row = getUserById(userId);
  if (!row) return null;
  // Owners implicitly keep full access even if stored values drift.
  if (isOwnerLike(row.role)) {
    return ownerLike({
      id: row.id,
      username: row.username,
      name: row.name,
      isMaster: false,
    });
  }
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    isMaster: false,
    sections: row.sections?.length ? row.sections : [],
    categoryScope: row.categoryScope ?? null,
  };
}

/** Read the admin access from the request cookie header (route handlers). */
export function accessFromRequest(req: Request): AdminAccess | null {
  const header = req.headers.get("cookie");
  const token = readSessionCookie(header);
  return accessFromToken(token);
}

/** Read the admin access from next/headers cookies (server components). */
export function currentAccess(): AdminAccess | null {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return accessFromToken(token);
}

/** Can this access open a given admin section? */
export function canSection(a: AdminAccess | null, section: AdminSection): boolean {
  if (!a) return false;
  if (isOwnerLike(a.role)) return true;
  return a.sections.includes(section);
}

/** Can this access manage a product in the given category (name)? */
export function canCategory(
  a: AdminAccess | null,
  category: string | null | undefined
): boolean {
  if (!a) return false;
  if (isOwnerLike(a.role)) return true;
  if (!a.categoryScope) return true; // null scope = all categories
  if (!category) return false;
  return a.categoryScope.some(
    (c) => c.toLowerCase() === String(category).toLowerCase()
  );
}

/** The list of categories this access may manage (null = all). */
export function scopedCategories(a: AdminAccess | null): string[] | null {
  if (!a) return null;
  if (isOwnerLike(a.role) || !a.categoryScope) return null;
  return a.categoryScope;
}

/**
 * Server-component guard: redirects to login / dashboard when the current
 * admin may not open `section`. Returns the access when allowed.
 */
export function requireSection(section: AdminSection): AdminAccess {
  const a = currentAccess();
  if (!a) redirect("/admin/login");
  if (!canSection(a, section)) redirect("/admin/dashboard");
  return a;
}

/**
 * Route-handler guard: returns the access for a request that must be admin,
 * else null (caller sends 401).
 */
export function requireAdminRequest(req: Request): AdminAccess | null {
  return accessFromRequest(req);
}

/**
 * Route-handler section guard: returns access only when the caller is an
 * admin who may open `section`, else null.
 */
export function adminForSection(
  req: Request,
  section: AdminSection
): AdminAccess | null {
  const a = accessFromRequest(req);
  if (!a || !canSection(a, section)) return null;
  return a;
}

/**
 * Route-handler guard for a write to one product: returns access when the
 * caller is an admin with `products` AND may manage that product's category.
 */
export function adminForProductCategory(
  req: Request,
  category: string | null | undefined
): AdminAccess | null {
  const a = accessFromRequest(req);
  if (!a || !canSection(a, "products") || !canCategory(a, category)) return null;
  return a;
}

/** Convenience: 401 JSON for route handlers. */
export { unauthorizedResponse } from "./route-guard";
