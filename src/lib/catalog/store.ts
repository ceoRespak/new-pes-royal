import "server-only";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

/**
 * ============================================================
 * RESPak EXPRESS — self-hosted catalog store.
 * ============================================================
 * This site now owns its own product / category / settings data.
 * Everything is persisted to a single JSON file at /.data/store.json
 * (gitignored, not served by Next) — the same pattern already used for
 * orders, admin users and content overrides. No external backend needed.
 *
 * Product rows intentionally mirror the shape the admin UI already expects
 * (id/name/desc/price/sale_price/on_sale/badge/image/category/featured),
 * so the admin managers, dashboard and API routes keep working unchanged.
 * Image fields hold OUR OWN urls (`/api/files/<name>`), never remote ones.
 */

export interface RawCategory {
  id: string;
  name: string;
  image?: string;
  sort_order?: number;
}

export interface RawProduct {
  id: string;
  name: string;
  desc?: string;
  price?: string | number;
  sale_price?: string | number | null;
  on_sale?: boolean;
  badge?: string | null;
  image?: string | null;
  category?: string | null;
  category_id?: string | number | null;
  featured?: boolean;
  /** Rich content, stored on this site for every product. */
  features?: string[] | null;
  specs?: Record<string, string> | null;
  downloads?: { label?: string; url?: string; size?: string }[] | null;
  videos?: { label?: string; url?: string; link?: string }[] | null;
  warranty?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SettingsShape {
  [key: string]: unknown;
}

interface StoreFile {
  products: RawProduct[];
  categories: RawCategory[];
  settings: SettingsShape | null;
}

const DIR = join(process.cwd(), ".data");
const FILE = join(DIR, "store.json");
const UPLOADS = join(DIR, "uploads");

const emptyStore = (): StoreFile => ({
  products: [],
  categories: [],
  settings: null,
});

let mem: StoreFile | null = null;
let memMtime = 0;

function readFileStore(): StoreFile {
  try {
    if (!existsSync(FILE)) return emptyStore();
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as StoreFile;
    return {
      products: Array.isArray(parsed?.products) ? parsed.products : [],
      categories: Array.isArray(parsed?.categories) ? parsed.categories : [],
      settings:
        parsed?.settings && typeof parsed.settings === "object"
          ? parsed.settings
          : null,
    };
  } catch {
    return emptyStore();
  }
}

/**
 * mtime of store.json in ms (0 when the file does not exist).
 * Lets read-side memo caches (this file + live.ts) notice writes that
 * happened in a different Next module instance (route handlers vs pages
 * compile into separate bundles, so in-memory flags never cross them).
 */
export function storeFileMtime(): number {
  try {
    return statSync(FILE).mtimeMs;
  } catch {
    return 0;
  }
}

export function getStore(): StoreFile {
  const mtime = storeFileMtime();
  if (mem && memMtime === mtime) return mem;
  mem = readFileStore();
  memMtime = mtime;
  return mem;
}

function persist(): void {
  mkdirSync(DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(getStore(), null, 2), "utf8");
  renameSync(tmp, FILE);
}

/* ---------------- reads ---------------- */

export function getRawProducts(): RawProduct[] {
  return getStore().products;
}

export function getRawCategories(): RawCategory[] {
  return getStore().categories;
}

export function getSettingsStore(): SettingsShape | null {
  return getStore().settings;
}

export function getProductById(id: string): RawProduct | undefined {
  return getStore().products.find((p) => String(p.id) === String(id));
}

export function categoryByName(name: string): RawCategory | undefined {
  const n = String(name ?? "").trim().toLowerCase();
  return getStore().categories.find((c) => String(c.name).trim().toLowerCase() === n);
}

/* ---------------- product writes ---------------- */

export function upsertProduct(input: RawProduct): RawProduct {
  const store = getStore();
  const id = String(input.id ?? Date.now());
  const existing = store.products.find((p) => String(p.id) === id);
  const now = new Date().toISOString();
  const record: RawProduct = {
    ...(existing ?? {}),
    ...input,
    id,
    updated_at: now,
    created_at: existing?.created_at ?? now,
  };
  if (existing) {
    store.products = store.products.map((p) =>
      String(p.id) === id ? record : p
    );
  } else {
    store.products = [...store.products, record];
  }
  persist();
  return record;
}

export function deleteProduct(id: string): boolean {
  const store = getStore();
  const before = store.products.length;
  store.products = store.products.filter((p) => String(p.id) !== String(id));
  if (store.products.length === before) return false;
  persist();
  return true;
}

/* ---------------- category writes ---------------- */

export function upsertCategory(input: RawCategory): RawCategory {
  const store = getStore();
  const existing = input.id
    ? store.categories.find((c) => String(c.id) === String(input.id))
    : categoryByName(input.name);
  const id = existing?.id ?? String(input.id ?? Date.now());
  const record: RawCategory = { ...(existing ?? {}), ...input, id };
  if (existing) {
    store.categories = store.categories.map((c) =>
      String(c.id) === String(existing.id) ? record : c
    );
  } else {
    store.categories = [...store.categories, record];
  }
  persist();
  return record;
}

export function deleteCategory(id: string): boolean {
  const store = getStore();
  const before = store.categories.length;
  store.categories = store.categories.filter((c) => String(c.id) !== String(id));
  if (store.categories.length === before) return false;
  persist();
  return true;
}

/* ---------------- settings + file helpers ---------------- */

export function setSettingsStore(settings: SettingsShape): SettingsShape {
  getStore().settings = settings;
  persist();
  return settings;
}

/** Directory where admin uploads / migrated images are stored. */
export function uploadsDir(): string {
  mkdirSync(UPLOADS, { recursive: true });
  return UPLOADS;
}
