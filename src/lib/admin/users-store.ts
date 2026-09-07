import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Local admin user accounts (this site only). Passwords are stored salted +
 * SHA-256 hashed. File lives in /.data/ (gitignored, not served).
 *
 * A master login also always works while ADMIN_PASSWORD is set in .env.local
 * (username `admin`) so the panel can never be locked out.
 *
 * ROLES / ACCESS:
 *  - role is a coarse tier: "owner" (full control + user mgmt), "admin"
 *    (full store access, no user mgmt by default), "manager" (staff).
 *  - `sections` lists the admin panel sections this account may open.
 *    Owners implicitly have every section on (and cannot be locked out).
 *  - `categoryScope` limits which product categories an account can manage
 *    (used by the Products page + APIs). `null` = all categories.
 */

export type AdminRole = "owner" | "admin" | "manager";

export const ADMIN_SECTIONS = [
  "dashboard",
  "products",
  "orders",
  "categories",
  "content",
  "settings",
  "users",
] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

/** Sections an admin gets by default (business sections, no user mgmt). */
export const DEFAULT_ADMIN_SECTIONS: AdminSection[] = [
  "dashboard",
  "products",
  "orders",
  "categories",
  "content",
  "settings",
];

/** Sections a manager starts with (dashboard + products; owner can adjust). */
export const DEFAULT_MANAGER_SECTIONS: AdminSection[] = [
  "dashboard",
  "products",
];

export interface AdminUserRow {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  /** Explicit allowed sections (ignored for owners → full). */
  sections: AdminSection[];
  /** Allowed product-category scope; null = all categories. */
  categoryScope: string[] | null;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export type AdminUserPublic = Omit<AdminUserRow, "passwordHash" | "salt">;

/** A role that always implies every section (owner can't be locked out). */
export function isOwnerLike(role: AdminRole): boolean {
  return role === "owner";
}

export function roleSections(role: AdminRole): AdminSection[] {
  if (role === "owner") return [...ADMIN_SECTIONS];
  if (role === "admin") return [...DEFAULT_ADMIN_SECTIONS];
  return [...DEFAULT_MANAGER_SECTIONS];
}

const DIR = join(process.cwd(), ".data");
const FILE = join(DIR, "admin-users.json");

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const hashPw = (pw: string, salt: string) => sha(`${salt}:${pw}`);

function readRaw(): AdminUserRow[] {
  if (!existsSync(FILE)) return [];
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as AdminUserRow[];
  } catch {
    return [];
  }
}

function writeRaw(list: AdminUserRow[]) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(list, null, 2), "utf8");
}

export function getUsers(): AdminUserPublic[] {
  return readRaw().map((u) => toPublic(u));
}

function toPublic(u: AdminUserRow): AdminUserPublic {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    // Owners implicitly have every section — store what makes sense to show.
    sections: isOwnerLike(u.role)
      ? [...ADMIN_SECTIONS]
      : u.sections?.length
        ? u.sections
        : roleSections(u.role),
    categoryScope: u.categoryScope ?? null,
    createdAt: u.createdAt,
  };
}

export function getUserById(id: string): AdminUserRow | undefined {
  return readRaw().find((u) => u.id === id);
}

/** Master env password (set via ADMIN_PASSWORD in .env.local). */
export function masterPassword(): string {
  return process.env.ADMIN_PASSWORD || "";
}

/** True when credentials are the env master (owner). */
export function isMasterLogin(username: string, password: string): boolean {
  const master = masterPassword();
  return !!master && username === "admin" && password === master;
}

/** Verify a username+password against stored users. */
export function verifyUser(
  username: string,
  password: string
): AdminUserRow | null {
  const u = readRaw().find(
    (x) => x.username.toLowerCase() === username.toLowerCase()
  );
  if (!u) return null;
  const expected = hashPw(password, u.salt);
  const a = Buffer.from(expected);
  const b = Buffer.from(u.passwordHash);
  return a.length === b.length && a.equals(b) ? u : null;
}

/** Normalise the role string (safe default: manager for anything unknown). */
export function parseRole(v: unknown): AdminRole {
  return v === "owner" || v === "admin" ? v : "manager";
}

/** Keep only known section keys. */
export function cleanSections(v: unknown): AdminSection[] {
  if (!Array.isArray(v)) return [];
  const out: AdminSection[] = [];
  for (const s of v) {
    if ((ADMIN_SECTIONS as readonly string[]).includes(String(s)) && !out.includes(s as AdminSection))
      out.push(s as AdminSection);
  }
  return out;
}

/** Clean category scope: array of non-empty names, or null = all. */
export function cleanCategoryScope(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const names = v
    .map((x) => String(x ?? "").trim())
    .filter((x) => x.length > 0)
    .filter((x, i, a) => a.indexOf(x) === i);
  return names.length ? names : null;
}

export function createUser(input: {
  username: string;
  name?: string;
  role?: AdminRole;
  password: string;
  sections?: AdminSection[];
  categoryScope?: string[] | null;
}): { ok: boolean; error?: string; user?: AdminUserPublic } {
  const username = String(input.username ?? "").trim();
  const password = String(input.password ?? "");
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username))
    return { ok: false, error: "Username must be 3-30 chars (letters/numbers/._-)." };
  if (password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  const list = readRaw();
  if (list.some((u) => u.username.toLowerCase() === username.toLowerCase()))
    return { ok: false, error: "That username already exists." };
  const role = parseRole(input.role);
  const sections = cleanSections(input.sections);
  const effectiveSections =
    sections.length || isOwnerLike(role) ? sections : roleSections(role);
  const salt = randomBytes(12).toString("hex");
  const user: AdminUserRow = {
    id: randomBytes(8).toString("hex"),
    username,
    name: String(input.name ?? "").trim() || username,
    role,
    sections: effectiveSections,
    categoryScope: cleanCategoryScope(input.categoryScope),
    passwordHash: hashPw(password, salt),
    salt,
    createdAt: new Date().toISOString(),
  };
  list.push(user);
  writeRaw(list);
  return { ok: true, user: toPublic(user) };
}

export function updateUser(
  id: string,
  patch: {
    username?: string;
    name?: string;
    role?: AdminRole;
    password?: string;
    sections?: AdminSection[];
    categoryScope?: string[] | null;
    /** Set to false to leave sections unchanged. */
    sectionsChanged?: boolean;
  }
): { ok: boolean; error?: string; user?: AdminUserPublic } {
  const list = readRaw();
  const idx = list.findIndex((u) => u.id === id);
  if (idx === -1) return { ok: false, error: "User not found." };
  const user = list[idx];

  if (patch.username !== undefined) {
    const username = patch.username.trim();
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username))
      return { ok: false, error: "Username must be 3-30 chars (letters/numbers/._-)." };
    if (list.some((u, i) => i !== idx && u.username.toLowerCase() === username.toLowerCase()))
      return { ok: false, error: "That username already exists." };
    user.username = username;
  }
  if (patch.name !== undefined) user.name = patch.name.trim() || user.username;
  if (patch.role === "owner" || patch.role === "admin" || patch.role === "manager")
    user.role = patch.role;
  if (patch.sectionsChanged && patch.sections !== undefined) {
    const cleaned = cleanSections(patch.sections);
    user.sections =
      cleaned.length || isOwnerLike(user.role)
        ? cleaned
        : roleSections(user.role);
  }
  if (patch.categoryScope !== undefined) {
    user.categoryScope = cleanCategoryScope(patch.categoryScope);
  }
  if (patch.password !== undefined && patch.password !== "") {
    if (patch.password.length < 6)
      return { ok: false, error: "Password must be at least 6 characters." };
    user.salt = randomBytes(12).toString("hex");
    user.passwordHash = hashPw(patch.password, user.salt);
  }
  writeRaw(list);
  return { ok: true, user: toPublic(user) };
}

export function deleteUser(id: string): { ok: boolean; error?: string } {
  const list = readRaw();
  const idx = list.findIndex((u) => u.id === id);
  if (idx === -1) return { ok: false, error: "User not found." };
  if (list[idx].role === "owner" && list.length <= 1)
    return { ok: false, error: "Cannot delete the last owner account." };
  list.splice(idx, 1);
  writeRaw(list);
  return { ok: true };
}
