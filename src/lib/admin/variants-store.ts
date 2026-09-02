import "server-only";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { ProductVariant } from "@/types";

/**
 * Local variants store — the live backend's `product_variants` table cannot
 * persist variants (its `id` column has no default and the endpoint doesn't
 * generate one), so this premium site owns variants itself.
 *
 * Stored as:  public/data/variants.json
 *   { "<productId>": ProductVariant[] }
 */
const FILE = join(process.cwd(), "public", "data", "variants.json");

export type VariantStore = Record<string, ProductVariant[]>;

export function loadVariants(): VariantStore {
  try {
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
  mkdirSync(join(process.cwd(), "public", "data"), { recursive: true });
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
