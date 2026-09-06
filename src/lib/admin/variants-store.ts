import "server-only";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { ProductVariant } from "@/types";

/**
 * Local variants store — variants are site-owned and persist in /.data
 * (same place as the product catalog). Stored as:
 *   .data/variants.json    { "<productId>": ProductVariant[] }
 */
const DIR = join(process.cwd(), ".data");
const FILE = join(DIR, "variants.json");
// Legacy location (public/data) — copied over once on first read.
const LEGACY_FILE = join(process.cwd(), "public", "data", "variants.json");

function ensureFile(): void {
  if (!existsSync(FILE) && existsSync(LEGACY_FILE)) {
    try {
      mkdirSync(DIR, { recursive: true });
      copyFileSync(LEGACY_FILE, FILE);
    } catch {
      /* ignore */
    }
  }
}

export type VariantStore = Record<string, ProductVariant[]>;

export function loadVariants(): VariantStore {
  try {
    ensureFile();
    if (!existsSync(FILE)) return {};
    const raw = readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as VariantStore) : {};
  } catch {
    return {};
  }
}

export function variantsForProduct(productId: string): ProductVariant[] {
  return loadVariants()[productId] ?? [];
}

export function saveVariantsForProduct(
  productId: string,
  variants: ProductVariant[]
): void {
  const store = loadVariants();
  store[productId] = variants;
  mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
}

/** Normalize the editor's variant rows into the store shape. */
export function normalizeVariants(input: unknown): ProductVariant[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((v) => {
      const o = (v ?? {}) as Record<string, unknown>;
      const asVal = (x: unknown) =>
        typeof x === "number" || typeof x === "string" ? x : "";
      return {
        id: o.id ? String(o.id) : undefined,
        label: String(o.label ?? o.title ?? "").trim(),
        price: asVal(o.price),
        salePrice: asVal(o.salePrice ?? o.sale_price),
        image: String(o.image ?? ""),
      };
    })
    .filter((v) => v.label);
}
