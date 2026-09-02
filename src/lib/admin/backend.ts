import "server-only";

/**
 * Server-side proxy to the live Pearl Electric Solutions backend
 * (www.pespeshawar.pk / api.pespeshawar.pk).
 *
 * All calls happen Node→Node, so browser CORS never applies. For writes we
 * authenticate against the existing admin account (Sanctum). This mirrors the
 * working dev-proxy approach from the pespeshawar project: it treats the
 * backend as a Sanctum "stateful" app by forcing the Origin/Referer headers,
 * keeps the session + XSRF cookies in a server-side jar, and falls back to
 * bearer tokens when the API returns one.
 */

const BASE = process.env.PES_API_BASE || "https://api.pespeshawar.pk";
const ADMIN_EMAIL = process.env.PES_ADMIN_EMAIL || "admin";
// Real credentials live only in .env.local (gitignored).
// PES_ADMIN_PASSWORD must be configured to perform backend writes.
const ADMIN_PASSWORD = process.env.PES_ADMIN_PASSWORD || "";

const jar = new Set<string>();
let bearer: string | null = null;
let authState: "idle" | "trying" | "ok" | "failed" = "idle";
const getCache = new Map<string, { at: number; data: unknown }>();
const GET_TTL = 15_000;

function cookieHeader(): string {
  return Array.from(jar).join("; ");
}

function xsrfToken(): string | null {
  for (const c of jar) {
    if (c.startsWith("XSRF-TOKEN=")) {
      try {
        return decodeURIComponent(c.slice("XSRF-TOKEN=".length));
      } catch {
        return c.slice("XSRF-TOKEN=".length);
      }
    }
  }
  return null;
}

function getSetCookie(res: Response): string[] {
  const fn = (res.headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;
  if (typeof fn === "function") {
    try {
      return fn.call(res.headers);
    } catch {
      /* fall through */
    }
  }
  const raw = res.headers.get("set-cookie");
  return raw ? [raw] : [];
}

function captureCookies(res: Response): void {
  for (const sc of getSetCookie(res)) {
    const first = sc.split(";")[0];
    const name = first.split("=")[0];
    if (!name) continue;
    // drop any existing cookie with the same name, keep newest
    for (const c of Array.from(jar)) {
      if (c.startsWith(name + "=")) jar.delete(c);
    }
    jar.add(first);
  }
}

function originHeaders(): Record<string, string> {
  return {
    Origin: "https://pespeshawar.pk",
    Referer: "https://pespeshawar.pk/",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
}

async function doLogin(): Promise<boolean> {
  const username = process.env.PES_ADMIN_USERNAME || ADMIN_EMAIL;
  // The live API accepts a `username` field; some installs use `email`.
  const payloads: Array<Record<string, string>> = [
    { username, password: ADMIN_PASSWORD },
    { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  ];

  for (const payload of payloads) {
    try {
      // prime a fresh CSRF cookie for each attempt
      const csrf = await fetch(`${BASE}/sanctum/csrf-cookie`, {
        redirect: "manual",
        headers: originHeaders(),
        cache: "no-store",
      });
      captureCookies(csrf);

      const login = await fetch(`${BASE}/api/login`, {
        method: "POST",
        headers: {
          ...originHeaders(),
          "Content-Type": "application/json",
          "Cookie": cookieHeader(),
          ...(xsrfToken() ? { "X-XSRF-TOKEN": xsrfToken()! } : {}),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      captureCookies(login);

      let json: Record<string, unknown> | null = null;
      try {
        json = (await login.json()) as Record<string, unknown>;
      } catch {
        /* not json */
      }
      const token =
        json && (json.token || json.plainTextToken || json.access_token);
      if (typeof token === "string") bearer = token;

      if (login.ok || bearer) {
        authState = "ok";
        return true;
      }
      // 422/401 → try the next payload shape
    } catch (e) {
      console.error("[pes-admin] login attempt failed:", e);
    }
  }

  authState = "failed";
  return false;
}

async function ensureAuth(force = false): Promise<boolean> {
  if (!force && authState === "ok") return true;
  if (authState !== "trying") authState = "trying";
  return doLogin();
}

export interface BackendResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  retried = false
): Promise<BackendResult<T>> {
  const headers: Record<string, string> = { ...originHeaders() };
  const isGet = method === "GET";

  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  } else {
    if (jar.size) headers.Cookie = cookieHeader();
    if (xsrfToken() && !isGet) headers["X-XSRF-TOKEN"] = xsrfToken()!;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: isGet ? "no-store" : "no-store",
    });
  } catch (e) {
    return { ok: false, status: 0, data: null, error: String(e) };
  }

  captureCookies(res);

  // session/token expired → retry once after a fresh login
  if ((res.status === 401 || res.status === 419) && !retried) {
    authState = "failed";
    bearer = null;
    const ok = await ensureAuth(true);
    if (ok) return request<T>(method, path, body, true);
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const err = extractError(data, text, res.status);
    return { ok: false, status: res.status, data: null, error: err };
  }
  return { ok: true, status: res.status, data: (data as T) ?? null };
}

function extractError(data: unknown, text: string, status: number): string {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (d.message) return String(d.message);
    if (d.error) return String(d.error);
    if (d.errors) {
      const e = d.errors as Record<string, string[]>;
      return Object.values(e)
        .flat()
        .join("; ");
    }
  }
  return `Backend error (${status}): ${text.slice(0, 200)}`;
}

/* ---------------- public API used by admin routes ---------------- */

export async function backendGet<T = unknown>(path: string): Promise<BackendResult<T>> {
  const hit = getCache.get(path);
  if (hit && Date.now() - hit.at < GET_TTL) {
    return { ok: true, status: 200, data: hit.data as T };
  }
  const result = await request<T>("GET", path);
  if (result.ok && result.data !== null) {
    getCache.set(path, { at: Date.now(), data: result.data });
  }
  return result;
}

export function clearCache(): void {
  getCache.clear();
}

export async function backendPost<T = unknown>(
  path: string,
  body?: unknown
): Promise<BackendResult<T>> {
  const authed = await ensureAuth();
  if (!authed) {
    return {
      ok: false,
      status: 401,
      data: null,
      error: "Could not authenticate with the pespeshawar.pk backend. Check PES_ADMIN_EMAIL / PES_ADMIN_PASSWORD in .env.local.",
    };
  }
  return request<T>("POST", path, body);
}

export async function backendPut<T = unknown>(
  path: string,
  body?: unknown
): Promise<BackendResult<T>> {
  const authed = await ensureAuth();
  if (!authed) {
    return {
      ok: false,
      status: 401,
      data: null,
      error: "Could not authenticate with the pespeshawar.pk backend. Check PES_ADMIN_EMAIL / PES_ADMIN_PASSWORD in .env.local.",
    };
  }
  return request<T>("PUT", path, body);
}

export async function backendDelete<T = unknown>(
  path: string
): Promise<BackendResult<T>> {
  const authed = await ensureAuth();
  if (!authed) {
    return {
      ok: false,
      status: 401,
      data: null,
      error: "Could not authenticate with the pespeshawar.pk backend. Check PES_ADMIN_EMAIL / PES_ADMIN_PASSWORD in .env.local.",
    };
  }
  return request<T>("DELETE", path);
}

/* Shape helpers -------------------------------------------------- */

/** Backend stores arrays/objects as JSON strings — normalize on read. */
export function maybeParse<T>(value: unknown): T | unknown {
  if (typeof value !== "string") return value;
  const t = value.trim();
  if (!t.startsWith("[") && !t.startsWith("{")) return value;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value;
  }
}

/** Round-trip: stringify arrays/objects the way the backend expects. */
export function maybeStringify(value: unknown): unknown {
  if (Array.isArray(value) || (value && typeof value === "object")) {
    return JSON.stringify(value);
  }
  return value;
}

/* Connection + upload helpers --------------------------------------- */

export function backendConnectionInfo() {
  const username = process.env.PES_ADMIN_USERNAME || ADMIN_EMAIL;
  const credsSet = Boolean(
    process.env.PES_ADMIN_USERNAME ||
      process.env.PES_ADMIN_EMAIL ||
      process.env.PES_ADMIN_PASSWORD
  );
  return {
    base: BASE,
    username,
    credsSet,
    usesDefaultPassword: !process.env.PES_ADMIN_PASSWORD,
  };
}

export async function backendTestLogin(): Promise<{
  ok: boolean;
  info: string;
}> {
  const ok = await ensureAuth(true);
  const who = process.env.PES_ADMIN_USERNAME || ADMIN_EMAIL;
  return ok
    ? { ok: true, info: `Connected to ${BASE} as "${who}"` }
    : {
        ok: false,
        info: `Could not log in to ${BASE}. Check PES_ADMIN_USERNAME / PES_ADMIN_PASSWORD in .env.local.`,
      };
}

/** Forward an image file to the backend's /api/upload endpoint. */
export async function backendUploadFile(
  buf: Uint8Array,
  filename: string
): Promise<BackendResult<{ url?: string }>> {
  const authed = await ensureAuth();
  if (!authed) {
    return {
      ok: false,
      status: 401,
      data: null,
      error:
        "Could not authenticate with the pespeshawar.pk backend for upload. Check PES_ADMIN_USERNAME / PES_ADMIN_PASSWORD in .env.local.",
    };
  }
  // try the common multipart field names the backend may expect
  const fields = ["image", "file", "photo"];
  for (const field of fields) {
    const headers: Record<string, string> = { ...originHeaders() };
    if (bearer) {
      headers.Authorization = `Bearer ${bearer}`;
    } else {
      if (jar.size) headers.Cookie = cookieHeader();
      if (xsrfToken()) headers["X-XSRF-TOKEN"] = xsrfToken()!;
    }
    const fd = new FormData();
    fd.append(field, new Blob([buf.slice().buffer]), filename || "upload");
    let res: Response;
    try {
      res = await fetch(`${BASE}/api/upload`, {
        method: "POST",
        headers,
        body: fd,
      });
    } catch (e) {
      return { ok: false, status: 0, data: null, error: String(e) };
    }
    const text = await res.text();
    let data: { url?: string } | null = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
    if (res.ok && data?.url) {
      return { ok: true, status: res.status, data };
    }
    // a validation error (422) might just mean a different field name —
    // keep trying; any other error is final.
    if (res.status !== 422) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: extractError(data, text, res.status),
      };
    }
  }
  return {
    ok: false,
    status: 422,
    data: null,
    error:
      "The backend rejected the upload for every field name (image/file/photo). Check the image type/size.",
  };
}
