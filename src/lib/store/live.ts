import "server-only";
import type { CategoryMeta, Product } from "@/types";
import {
  getRawCategories,
  getRawProducts,
  storeFileMtime,
  type RawCategory,
  type RawProduct,
} from "@/lib/catalog/store";
import { detectBrand } from "@/data/brands";
import { getProductSub } from "@/data/subcategories";
import { subNameOverride, subcatsMetaMtime } from "@/lib/catalog/subcats";

/**
 * Runtime catalog loader — now backed by THIS SITE'S OWN local store
 * (`/.data/store.json`, see src/lib/catalog/store.ts).
 *
 * Public pages read the normalized Product/CategoryMeta shapes through this
 * module (kept for compatibility with the old live-API loader). Admin edits
 * write to the same store, so changes show up immediately — no remote
 * backend, no API fetch, no stale cache.
 */

// Local image resolver: stored urls are already served by this site
// (`/api/files/...`); absolute legacy urls pass through unchanged.
const abs = (p?: string | null) => (!p ? "" : p);

const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/[’'&]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "item";

const firstNumber = (s?: string | number | null): number | null => {
  const m = String(s ?? "").match(/(\d[\d,]*)/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
};

const clean = (s: string | null | undefined = "") =>
  String(s ?? "")
    .replace(/\u0000/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .trim();

const sentence = (s?: string) => (s ? clean(s) : "");

/* Editorial category meta (mirrors the old import script). */
const CATEGORY_META: Record<string, Partial<CategoryMeta>> = {
  FAN: { icon: "fan", accent: "#FF5A00", tagline: "Ceiling & bracket fans from Pakistan's top brands" },
  "Exhaust Fans": { icon: "fan", accent: "#0047B3", tagline: "Kitchen, bath & industrial ventilation" },
  "Lighting Solutions": { icon: "bulb", accent: "#FF7A1A", tagline: "LED bulbs, panels & decorative lighting" },
  "Wires & Cables": { icon: "wire", accent: "#FF7A1A", tagline: "Pakistan Cables, AGE, Fast & more" },
  "Switches & Sockets": { icon: "switch", accent: "#0047B3", tagline: "Clipsal, Schneider, ABB & genuine brands" },
  "Circuit Breakers": { icon: "breaker", accent: "#002B6B", tagline: "MCBs, MCCBs, RCDs & change-overs" },
  "Distribution Boards (DBs)": { icon: "dbs", accent: "#FF5A00", tagline: "Load centres for every project" },
  "Solar Accessories": { icon: "solar", accent: "#FF7A1A", tagline: "Solar gear for homes & industry" },
  "Smart Home": { icon: "smart", accent: "#0047B3", tagline: "BlueDot switches & automation" },
  "Conduites & Back Boxes": { icon: "conduit", accent: "#9aa7b8", tagline: "Conduit pipes, ducts & boxes" },
  "Shutters & Covers": { icon: "shutter", accent: "#002B6B", tagline: "Exhaust shutters & covers" },
  "Earthing Accessories": { icon: "earthing", accent: "#C2410C", tagline: "Copper rods & grounding gear" },
  Others: { icon: "other", accent: "#0047B3", tagline: "Everyday electrical essentials" },
};

function buildCatalog(productsRaw: RawProduct[], catsRaw: RawCategory[]) {
  // Admin-set order: categories sort by `sort_order` (ascending). Categories
  // without a value keep their store order after any explicitly-ordered ones.
  const catsOrdered = [...catsRaw].sort((a, b) => {
    const ao = a.sort_order == null ? Number.MAX_SAFE_INTEGER : Number(a.sort_order);
    const bo = b.sort_order == null ? Number.MAX_SAFE_INTEGER : Number(b.sort_order);
    return ao - bo;
  });
  const catNameToSlug = new Map<string, string>();
  const catsMeta: CategoryMeta[] = catsOrdered
    .map((c) => {
      const name = clean(c.name);
      const slug = slugify(name);
      catNameToSlug.set(name, slug);
      const meta = CATEGORY_META[name] || {
        icon: "other" as const,
        accent: "#0047B3",
        tagline: `${name}`,
        description: `Browse our full range of ${name.toLowerCase()} — genuine brands, fair prices and expert advice in store.`,
      };
      return {
        id: slug,
        name,
        shortName: meta.shortName || name,
        tagline: meta.tagline ?? "",
        description: meta.description ?? "",
        icon: meta.icon ?? "other",
        accent: meta.accent ?? "#0047B3",
        image: c.image ? abs(c.image) : "",
        count: 0,
      };
    })
    .filter((c) => c.id !== slugify(""));

  const usedSlugs = new Set<string>();
  const products: Product[] = productsRaw.map((p) => {
    const name = clean(p.name);
    let slug = slugify(name);
    const base = slug;
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
    usedSlugs.add(slug);

    const catName = clean(p.category);
    const category = catNameToSlug.get(catName) || slugify(catName);
    const price = firstNumber(p.price) ?? firstNumber(p.sale_price) ?? 0;
    const sale =
      p.on_sale && p.sale_price != null && p.sale_price !== ""
        ? firstNumber(p.sale_price)
        : null;
    const salePrice = sale !== null && sale > 0 && sale < price ? sale : undefined;

    const nameCleaned = clean(name);
    const detectedBrand = detectBrand(nameCleaned);
    const detectedSub = getProductSub(catName, nameCleaned);
    const subRef = detectedSub
      ? {
          id: detectedSub.id,
          name: subNameOverride(catName, detectedSub.id, detectedSub.name),
        }
      : undefined;

    const desc = sentence(p.desc);
    const isDup =
      desc.replace(/\.+$/, "").trim().toLowerCase() ===
      name.trim().toLowerCase();
    const effectiveDesc = isDup ? "" : desc;

    const badge = clean(p.badge);
    const badgeText =
      badge && badge.toLowerCase() !== "sale" ? badge : undefined;
    const shortBadge = badgeText
      ? badgeText.length > 12
        ? badgeText.slice(0, 12)
        : badgeText
      : p.on_sale && salePrice !== undefined
        ? "Sale"
        : undefined;

    return {
      id: String(p.id),
      slug,
      name,
      category,
      price,
      ...(salePrice !== undefined ? { salePrice } : {}),
      tagline: isDup ? "" : desc.split(/[.!?]/)[0].slice(0, 130),
      description: effectiveDesc,
      features: Array.isArray(p.features) ? p.features.map((f) => String(f)) : [],
      specs:
        p.specs && typeof p.specs === "object"
          ? (p.specs as Record<string, string>)
          : {},
      images: [abs(p.image)].filter(Boolean) as string[],
      downloads: Array.isArray(p.downloads)
        ? p.downloads
            .map((d) => ({
              label: String(d?.label ?? ""),
              url: abs(d?.url) || "",
              size: d?.size ? String(d.size) : undefined,
            }))
            .filter((d) => d.url)
        : [],
      videos: Array.isArray(p.videos)
        ? p.videos
            .map((v) => ({
              label: v?.label ? String(v.label) : undefined,
              url: v?.url ? String(v.url) : undefined,
              link: v?.link ? String(v.link) : undefined,
            }))
            .filter((v) => v.url || v.link)
        : undefined,
      badge: shortBadge,
      featured: Boolean(p.featured),
      bestSeller: (badge || "").toLowerCase().includes("bestseller"),
      newArrival: (badge || "").toLowerCase() === "new",
      inStock: true,
      rating: 0,
      reviews: 0,
      warranty: p.warranty ? String(p.warranty) : "",
      ...(detectedBrand ? { brand: detectedBrand.brand } : {}),
      ...(detectedBrand?.line ? { brandLine: detectedBrand.line.name } : {}),
      ...(subRef ? { sub: subRef } : {}),
    } as Product;
  });

  const countBySlug = new Map<string, number>();
  for (const pr of products) {
    countBySlug.set(pr.category, (countBySlug.get(pr.category) ?? 0) + 1);
  }
  const categories: CategoryMeta[] = catsMeta.map((c) => ({
    ...c,
    count: countBySlug.get(c.id) ?? 0,
  }));

  return { products, categories };
}

/* ---------------- in-memory catalog (refreshed on writes) ---------------- */

let catalogMemo: { products: Product[]; categories: CategoryMeta[] } | null = null;
let catalogStamp = "";

export function clearLiveCache(): void {
  catalogMemo = null;
}

async function getLiveCatalog(): Promise<{
  products: Product[];
  categories: CategoryMeta[];
}> {
  // store.json + subcategory-meta.json mtimes double as change stamps across
  // module instances (route handlers and pages compile into separate bundles).
  const stamp = `${storeFileMtime()}|${subcatsMetaMtime()}`;
  if (!catalogMemo || stamp !== catalogStamp) {
    catalogMemo = buildCatalog(getRawProducts(), getRawCategories());
    catalogStamp = stamp;
  }
  return catalogMemo;
}

/* ---------------- public API ---------------- */

export async function getLiveProducts(): Promise<Product[]> {
  return (await getLiveCatalog()).products;
}

export async function getLiveCategories(): Promise<CategoryMeta[]> {
  return (await getLiveCatalog()).categories;
}

export async function getLiveProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const products = await getLiveProducts();
  return products.find((p) => p.slug === slug);
}

export async function getLiveRelated(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const products = await getLiveProducts();
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
