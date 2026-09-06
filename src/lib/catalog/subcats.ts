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
import { SUBCATEGORIES, type SubDef } from "@/data/subcategories";

/**
 * ============================================================
 * Sub-category (Shop-by-Type card) metadata overrides.
 * ============================================================
 * The sub-category TYPES themselves (ids, names, keyword matchers) are defined
 * in src/data/subcategories.ts and drive auto-detection. This module stores
 * the ADMIN-EDITABLE extras for each type — most importantly the card IMAGE
 * (and optionally a display-name override) — in `/.data/subcategory-meta.json`.
 *
 * Shape: { "<Category name>": { "<type id>": { name?, image? }, ... }, ... }
 */

export interface SubTypeMeta {
  name?: string;
  image?: string;
}

export type SubcatsMeta = Record<string, Record<string, SubTypeMeta>>;

export interface MergedType {
  id: string;
  name: string;
  image?: string;
  /** True when the image was set by the admin (vs. auto from a product). */
  imageCustom?: boolean;
}

const DIR = join(process.cwd(), ".data");
const FILE = join(DIR, "subcategory-meta.json");

const empty = (): SubcatsMeta => ({});

/** mtime (ms) of the meta file — used to refresh in-memory catalog caches. */
export function subcatsMetaMtime(): number {
  try {
    return statSync(FILE).mtimeMs;
  } catch {
    return 0;
  }
}

function read(): SubcatsMeta {
  try {
    if (!existsSync(FILE)) return empty();
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as SubcatsMeta;
    return parsed && typeof parsed === "object" ? parsed : empty();
  } catch {
    return empty();
  }
}

let mem: SubcatsMeta | null = null;
let memMtime = 0;

export function getSubcatsMeta(): SubcatsMeta {
  const mtime = subcatsMetaMtime();
  if (mem && memMtime === mtime) return mem;
  mem = read();
  memMtime = mtime;
  return mem;
}

/** Default types for a category (from the code seed). */
export function defaultTypesFor(catName: string): SubDef[] {
  return SUBCATEGORIES[catName] ?? [];
}

/**
 * Merged visible type cards for one category: default definitions plus any
 * admin overrides (image + renamed display name).
 */
export function mergedTypesFor(catName: string): MergedType[] {
  const meta = getSubcatsMeta()[catName] ?? {};
  return defaultTypesFor(catName).map((d) => {
    const m = meta[d.id];
    return {
      id: d.id,
      name: m?.name || d.name,
      image: m?.image || undefined,
      imageCustom: Boolean(m?.image),
    };
  });
}

/** Display-name override used while building the catalog (default = fallback). */
export function subNameOverride(
  catName: string,
  subId: string,
  fallback: string
): string {
  return getSubcatsMeta()[catName]?.[subId]?.name || fallback;
}

/**
 * Save the type-card overrides for one category. Items are the visible types
 * ({ id, name?, image? }); missing ids are dropped, existing entries keep any
 * fields the admin did not change.
 */
export function saveSubcatsCategory(
  catName: string,
  items: { id: string; name?: string; image?: string | null }[]
): void {
  const all = getSubcatsMeta();
  const cur = all[catName] ?? {};
  const next: Record<string, SubTypeMeta> = {};
  items.forEach((it) => {
    const prev = cur[it.id] ?? {};
    next[it.id] = {
      name: it.name !== undefined && it.name !== "" ? it.name : prev.name,
      image:
        it.image === null
          ? undefined
          : it.image !== undefined && it.image !== ""
            ? it.image
            : prev.image,
    };
  });
  all[catName] = next;
  mkdirSync(DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(all, null, 2), "utf8");
  renameSync(tmp, FILE);
  mem = all;
  memMtime = 0; // force a re-stat on the next read
}
