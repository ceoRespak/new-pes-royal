import "server-only";
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import {
  categoryByName,
  deleteCategory,
  deleteProduct,
  getRawCategories,
  getRawProducts,
  getSettingsStore,
  setSettingsStore,
  uploadsDir,
  upsertCategory,
  upsertProduct,
  type RawCategory,
  type RawProduct,
} from "@/lib/catalog/store";

/**
 * Local, self-hosted data layer.
 *
 * This used to proxy every read/write to the remote pespeshawar.pk backend.
 * Now all product / category / settings / upload operations are served from
 * this site's own store (`/.data/store.json` + `/.data/uploads`). The public
 * API surface (BackendResult + backendGet/Post/Put/Delete/UploadFile) is kept
 * identical so the existing admin routes and managers keep working unchanged.
 */

export interface BackendResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

const okRes = <T>(data: T): BackendResult<T> => ({
  ok: true,
  status: 200,
  data,
});
const errRes = (error: string, status = 500): BackendResult<never> => ({
  ok: false,
  status,
  data: null,
  error,
});

/* ---------------- helpers ---------------- */

const cleanStr = (v: unknown): string => String(v ?? "").trim();
const cleanNullable = (v: unknown): string | null =>
  v === null || v === undefined || String(v).trim() === "" ? null : String(v);

/** Normalise an admin product payload into a persisted RawProduct. */
function toRawProduct(body: Record<string, unknown>, id?: string): RawProduct {
  return {
    id: String(id ?? body.id ?? Date.now()),
    name: cleanStr(body.name),
    desc: cleanStr(body.desc),
    price:
      body.price !== undefined && body.price !== ""
        ? String(body.price)
        : undefined,
    sale_price:
      body.sale_price !== undefined && body.sale_price !== ""
        ? String(body.sale_price)
        : null,
    on_sale: Boolean(body.on_sale),
    badge: cleanNullable(body.badge),
    image: cleanNullable(body.image),
    category: cleanNullable(body.category),
    category_id:
      body.category_id !== undefined && body.category_id !== null
        ? String(body.category_id)
        : null,
    featured: Boolean(body.featured),
    features: Array.isArray(body.features)
      ? body.features.map((f) => String(f))
      : undefined,
    specs:
      body.specs && typeof body.specs === "object" && !Array.isArray(body.specs)
        ? (body.specs as Record<string, string>)
        : undefined,
    downloads: Array.isArray(body.downloads)
      ? body.downloads.map((d) => {
          const o = (d ?? {}) as Record<string, unknown>;
          return {
            label: String(o.label ?? ""),
            url: String(o.url ?? ""),
            size: o.size != null ? String(o.size) : undefined,
          };
        })
      : undefined,
    videos: Array.isArray(body.videos)
      ? body.videos.map((v) => {
          const o = (v ?? {}) as Record<string, unknown>;
          return {
            label: o.label ? String(o.label) : undefined,
            url: o.url ? String(o.url) : undefined,
            link: o.link ? String(o.link) : undefined,
          };
        })
      : undefined,
    warranty: cleanNullable(body.warranty) ?? undefined,
  };
}

function toRawCategory(body: Record<string, unknown>, id?: string): RawCategory {
  const name = cleanStr(body.name);
  return {
    id: String(id ?? body.id ?? (name || Date.now())),
    name,
    image: cleanNullable(body.image) ?? undefined,
    sort_order: Number(body.sort_order ?? 0),
  };
}

async function handle(
  method: string,
  path: string,
  body?: unknown
): Promise<BackendResult<unknown>> {
  const rest = path.replace(/^\/api\//, "");
  const [entity, rawId] = rest.split("/");

  // ---------- PRODUCTS ----------
  if (entity === "products") {
    if (method === "GET") return okRes(getRawProducts());

    const b = (body ?? {}) as Record<string, unknown>;
    if (method === "POST" || method === "PUT") {
      const id = String(b.id ?? rawId ?? Date.now());
      const record = upsertProduct(toRawProduct(b, id));
      return okRes(record);
    }
    if (method === "DELETE") {
      if (!rawId) return errRes("Missing product id", 400);
      return deleteProduct(rawId)
        ? okRes({ ok: true })
        : errRes("Product not found", 404);
    }
    return errRes("Unsupported method", 405);
  }

  // ---------- CATEGORIES ----------
  if (entity === "categories") {
    if (method === "GET") return okRes({ categories: getRawCategories() });

    const b = (body ?? {}) as Record<string, unknown>;
    if (method === "POST" || method === "PUT") {
      // Merge with an existing category of the same name (rename-safe).
      const existing =
        (b.id
          ? getRawCategories().find((c) => String(c.id) === String(b.id))
          : undefined) ?? categoryByName(String(b.name ?? ""));
      const record = upsertCategory(
        toRawCategory(b, existing?.id ?? String(b.id ?? ""))
      );
      return okRes(record);
    }
    if (method === "DELETE") {
      if (!rawId) return errRes("Missing category id", 400);
      return deleteCategory(rawId)
        ? okRes({ ok: true })
        : errRes("Category not found", 404);
    }
    return errRes("Unsupported method", 405);
  }

  // ---------- SETTINGS ----------
  if (entity === "settings") {
    if (method === "GET") return okRes(getSettingsStore() ?? {});
    if (method === "POST" || method === "PUT") {
      const settings =
        body && typeof body === "object"
          ? (body as Record<string, unknown>)
          : {};
      return okRes(setSettingsStore(settings));
    }
    return errRes("Unsupported method", 405);
  }

  return errRes(`Unknown local endpoint: /api/${entity}`, 404);
}

/* ---------------- public API (same surface as before) ---------------- */

export async function backendGet<T = unknown>(
  path: string
): Promise<BackendResult<T>> {
  return (await handle("GET", path)) as BackendResult<T>;
}

export async function backendPost<T = unknown>(
  path: string,
  body?: unknown
): Promise<BackendResult<T>> {
  return (await handle("POST", path, body)) as BackendResult<T>;
}

export async function backendPut<T = unknown>(
  path: string,
  body?: unknown
): Promise<BackendResult<T>> {
  return (await handle("PUT", path, body)) as BackendResult<T>;
}

export async function backendDelete<T = unknown>(
  path: string
): Promise<BackendResult<T>> {
  return (await handle("DELETE", path)) as BackendResult<T>;
}

/** Legacy cache-clear hook — the local store is always fresh. */
export function clearCache(): void {
  /* no-op */
}

/* Shape helpers (kept for compatibility) -------------------------------- */

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

export function maybeStringify(value: unknown): unknown {
  if (Array.isArray(value) || (value && typeof value === "object")) {
    return JSON.stringify(value);
  }
  return value;
}

/* Connection + upload helpers ------------------------------------------- */


const EXT_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
};

/** Save an uploaded file into this site's own storage and return its local url. */
export async function backendUploadFile(
  buf: Uint8Array,
  filename: string
): Promise<BackendResult<{ url?: string }>> {
  try {
    if (!buf || buf.byteLength === 0) {
      return errRes("Empty file", 400);
    }
    const ext = (extname(String(filename || "image")).toLowerCase() ||
      ".png") as keyof typeof EXT_MAP;
    const safeExt = EXT_MAP[ext] ? ext : ".png";
    const name = `${Date.now()}-${randomBytes(4).toString("hex")}${safeExt}`;
    writeFileSync(join(uploadsDir(), name), Buffer.from(buf));
    return okRes({ url: `/api/files/${name}` });
  } catch (e) {
    return errRes(String(e), 500);
  }
}
