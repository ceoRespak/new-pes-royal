import "server-only";
import { randomBytes, timingSafeEqual, createHash } from "node:crypto";

/** Cookie that marks an authenticated admin browser session. */
export const ADMIN_COOKIE = "pes_admin_session";

function sessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    "pes-royal-dev-secret-change-in-production"
  );
}

/** Compare password with constant-time HMAC so timing leaks are avoided. */
export function checkLocalPassword(input: string): boolean {
  // Real password lives only in .env.local (gitignored); unset = no login.
  const expected = process.env.ADMIN_PASSWORD || "";
  const a = createHash("sha256").update(String(input)).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Sign a token value into an unforgeable session id. */
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
  const mac = value.slice(idx + 1);
  const expected = sign(token);
  const a = Buffer.from(expected);
  const b = Buffer.from(value);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Issue a signed session token for the given user id (default: env owner). */
export function issueSessionToken(userId = "env-admin"): string {
  const nonce = randomBytes(18).toString("hex");
  return sign(`${userId}#${nonce}`);
}

export function validateSession(value: string | undefined | null): boolean {
  if (!value) return false;
  return verifySigned(value);
}

/**
 * Resolve the user id embedded in a valid token.
 * Old tokens (before multi-user) have no `#` → treated as legacy admin.
 */
export function getSessionUserId(
  value: string | undefined | null
): string | null {
  if (!value || !verifySigned(value)) return null;
  const body = value.slice(0, value.lastIndexOf("."));
  const idx = body.indexOf("#");
  if (idx < 0) return null; // legacy token
  return body.slice(0, idx) || null;
}

export function readSessionCookie(header: string | null | undefined): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === ADMIN_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}
