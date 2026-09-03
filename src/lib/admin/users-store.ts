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
 */

export interface AdminUserRow {
  id: string;
  username: string;
  name: string;
  role: "owner" | "admin";
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export type AdminUserPublic = Omit<AdminUserRow, "passwordHash" | "salt">;

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

export function createUser(input: {
  username: string;
  name?: string;
  role?: "owner" | "admin";
  password: string;
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
  const salt = randomBytes(12).toString("hex");
  const user: AdminUserRow = {
    id: randomBytes(8).toString("hex"),
    username,
    name: String(input.name ?? "").trim() || username,
    role: input.role === "admin" ? "admin" : "owner",
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
    role?: "owner" | "admin";
    password?: string;
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
  if (patch.role === "owner" || patch.role === "admin") user.role = patch.role;
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
