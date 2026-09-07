import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Customer accounts (public storefront login). Stored in /.data/customers.json
 * (gitignored). Passwords are salted + hashed (never plain text).
 */

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  address?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt?: string;
}

export type CustomerPublic = Omit<CustomerRow, "passwordHash" | "salt">;

const DIR = join(process.cwd(), ".data");
const FILE = join(DIR, "customers.json");

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const hashPw = (pw: string, salt: string) => sha(`${salt}:${pw}`);

function readRaw(): CustomerRow[] {
  if (!existsSync(FILE)) return [];
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as CustomerRow[];
  } catch {
    return [];
  }
}

function writeRaw(list: CustomerRow[]) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(list, null, 2), "utf8");
}

const toPublic = (c: CustomerRow): CustomerPublic => ({
  id: c.id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  city: c.city,
  address: c.address,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

export function getCustomerById(id: string): CustomerRow | undefined {
  return readRaw().find((c) => c.id === id);
}

export function getCustomerByEmail(email: string): CustomerRow | undefined {
  const e = String(email ?? "").trim().toLowerCase();
  return readRaw().find((c) => c.email.toLowerCase() === e);
}

export function getCustomerPublic(id: string): CustomerPublic | undefined {
  const c = getCustomerById(id);
  return c ? toPublic(c) : undefined;
}

export function verifyCustomer(
  email: string,
  password: string
): CustomerPublic | null {
  const c = getCustomerByEmail(email);
  if (!c) return null;
  const a = Buffer.from(hashPw(password, c.salt));
  const b = Buffer.from(c.passwordHash);
  return a.length === b.length && a.equals(b) ? toPublic(c) : null;
}

export function createCustomer(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  address?: string;
}): { ok: boolean; error?: string; customer?: CustomerPublic } {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const phone = String(input.phone ?? "").trim();
  const password = String(input.password ?? "");
  if (!name) return { ok: false, error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Please enter a valid email." };
  if (phone.replace(/[^\d]/g, "").length < 7)
    return { ok: false, error: "Please enter a valid phone number." };
  if (password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  if (getCustomerByEmail(email))
    return { ok: false, error: "An account with this email already exists." };

  const salt = randomBytes(12).toString("hex");
  const now = new Date().toISOString();
  const row: CustomerRow = {
    id: randomBytes(8).toString("hex"),
    name,
    email,
    phone,
    city: String(input.city ?? "").trim() || undefined,
    address: String(input.address ?? "").trim() || undefined,
    passwordHash: hashPw(password, salt),
    salt,
    createdAt: now,
  };
  const list = readRaw();
  list.push(row);
  writeRaw(list);
  return { ok: true, customer: toPublic(row) };
}

export function updateCustomerProfile(
  id: string,
  patch: { name?: string; phone?: string; city?: string; address?: string }
): { ok: boolean; error?: string; customer?: CustomerPublic } {
  const list = readRaw();
  const idx = list.findIndex((c) => c.id === id);
  if (idx < 0) return { ok: false, error: "Account not found." };
  const c = list[idx];
  if (patch.name !== undefined) c.name = String(patch.name).trim() || c.name;
  if (patch.phone !== undefined) {
    const phone = String(patch.phone).trim();
    if (phone.replace(/[^\d]/g, "").length < 7)
      return { ok: false, error: "Please enter a valid phone number." };
    c.phone = phone;
  }
  if (patch.city !== undefined)
    c.city = String(patch.city).trim() || c.city;
  if (patch.address !== undefined)
    c.address = String(patch.address).trim() || c.address;
  c.updatedAt = new Date().toISOString();
  writeRaw(list);
  return { ok: true, customer: toPublic(c) };
}
