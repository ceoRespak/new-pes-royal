import "server-only";
import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { getCustomerById, getCustomerPublic } from "./store";
import type { CustomerPublic } from "./store";

/**
 * Customer (storefront) session — signed cookie, separate from the admin
 * session. Lives for 30 days.
 */

export const CUSTOMER_COOKIE = "respak_customer_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sessionSecret(): string {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "respak-customer-dev-secret-change-me"
  );
}

function sign(token: string): string {
  const mac = createHash("sha256")
    .update(`${token}.${sessionSecret()}`)
    .digest("hex");
  return `${token}.${mac}`;
}

function verifySigned(value: string): boolean {
  const idx = value.lastIndexOf(".");
  if (idx < 1) return false;
  const token = value.slice(0, idx);
  const expected = sign(token);
  const a = Buffer.from(expected);
  const b = Buffer.from(value);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function issueCustomerToken(customerId: string): string {
  return sign(`${customerId}#${randomBytes(18).toString("hex")}`);
}

export function parseCustomerId(token?: string | null): string | null {
  if (!token || !verifySigned(token)) return null;
  const body = token.slice(0, token.lastIndexOf("."));
  const idx = body.indexOf("#");
  return idx < 0 ? null : body.slice(0, idx) || null;
}

export const customerCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
  secure: process.env.NODE_ENV === "production",
};

/** Resolve the currently signed-in customer (server components / routes). */
export async function getCurrentCustomer(): Promise<CustomerPublic | null> {
  try {
    const store = await cookies();
    const token = store.get(CUSTOMER_COOKIE)?.value;
    const id = parseCustomerId(token);
    if (!id) return null;
    const row = getCustomerById(id);
    return row ? getCustomerPublic(row.id) ?? null : null;
  } catch {
    return null;
  }
}
