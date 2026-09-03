import "server-only";
import type { CategoryMeta, Product } from "@/types";

/**
 * Runtime catalog loader for LOCALHOST dev.
 *
 * Public pages that used to read the frozen snapshot (src/data/*.ts) read the
 * LIVE pespeshawar.pk backend through this module instead, so admin-panel
 * edits (which are written to the live backend) show up on localhost within
 * the short cache window — no re-import / rebuild needed.
 *
 * Variants are still stored locally (public/data/variants.json) because the
 * live product_variants table cannot persist them (see variants-store.ts).
 */

const BASE = process.env.PES_API_BASE || "https://api.pespeshawar.pk";
const TTL = Number(process.env.PES_LIVE_CACHE_TTL || 15_000); // ms

const abs = (p?: string | null) =>
  !p ? "" : /^https?:\/\//.test(p) ? p : `${BASE}${p}`;

// NOTE: replicate scripts/import-pes.mjs slugify (strips ' & too) so slugs
// match the slugs baked into categories.ts / links.
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

/* Editorial category meta (mirrors scripts/import-pes.mjs CATEGORY_META). */
const CATEGORY_META: Record<string, Partial<CategoryMeta>> = {
  FAN: { icon: "fan", accent: "#d4af37", tagline: "Ceiling & bracket fans from Pakistan's top brands" },
  "Exhaust Fans": { icon: "fan", accent: "#5aa7d6", tagline: "Kitchen, bath & industrial ventilation" },
  "Lighting Solutions": { icon: "bulb", accent: "#f2c14e", tagline: "LED bulbs, panels & decorative lighting" },
  "Wires & Cables": { icon: "wire", accent: "#c9894a", tagline: "Pakistan Cables, AGE, Fast & more" },
  "Switches & Sockets": { icon: "switch", accent: "#4f9de0", tagline: "Clipsal, Schneider, ABB & genuine brands" },
  "Circuit Breakers": { icon: "breaker", accent: "#5fd0a6", tagline: "MCBs, MCCBs, RCDs & change-overs" },
  "Distribution Boards (DBs)": { icon: "dbs", accent: "#d98e4a", tagline: "Load centres for every project" },
  "Solar Accessories": { icon: "solar", accent: "#f2c14e", tagline: "Solar gear for homes & industry" },
  "Smart Home": { icon: "smart", accent: "#5aa7d6", tagline: "BlueDot switches & automation" },
  "Conduites & Back Boxes": { icon: "conduit", accent: "#9aa7b8", tagline: "Conduit pipes, ducts & boxes" },
  "Shutters & Covers": { icon: "shutter", accent: "#7ec89b", tagline: "Exhaust shutters & covers" },
  "Earthing Accessories": { icon: "earthing", accent: "#b3922a", tagline: "Copper rods & grounding gear" },
  Others: { icon: "other", accent: "#8ab6f0", tagline: "Everyday electrical essentials" },
};

/* ---------------- tiny fetch + cache ---------------- */
const cache = new Map<string, { at: number; data: unknown }>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Live API ${res.status} for ${url}`);
  return (await res.json()) as T;
}

async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.data as T;
  const data = await loader();
  cache.set(key, { at: Date.now(), data });
  return data;
}

export function clearLiveCache(): void {
  cache.clear();
}

/* ---------------- raw types from the live API ---------------- */
interface RawProduct {
  id: string | number;
  name: string;
  desc?: string;
  price?: string | number;
  sale_price?: string | number | null;
  on_sale?: boolean;
  badge?: string | null;
  image?: string | null;
  category?: string | null;
  featured?: boolean;
}

interface RawCategory {
  id: number;
  name: string;
  image?: string | null;
}

interface ProductsResponse extends Array<RawProduct> {}
interface CategoriesResponse {
  categories: RawCategory[];
}

/* ---------------- normalization ---------------- */
async function loadRaw() {
  const [productsRaw, catsRaw] = await Promise.all([
    cached<ProductsResponse>("products", () =>
      fetchJson<ProductsResponse>(`${BASE}/api/products`)
    ),
    cached<CategoriesResponse>("categories", () =>
      fetchJson<CategoriesResponse>(`${BASE}/api/categories`)
    ),
  ]);
  return { productsRaw, catsRaw: catsRaw.categories };
}

function buildCatalog(productsRaw: RawProduct[], catsRaw: RawCategory[]) {
  const catNameToSlug = new Map<string, string>();
  const catsMeta: CategoryMeta[] = catsRaw
    .map((c) => {
      const name = clean(c.name);
      const slug = slugify(name);
      catNameToSlug.set(name, slug);
      const meta = CATEGORY_META[name] || {
        icon: "other" as const,
        accent: "#8ab6f0",
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
        accent: meta.accent ?? "#8ab6f0",
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
      features: [],
      specs: {},
      images: [abs(p.image)].filter(Boolean) as string[],
      downloads: [],
      badge: shortBadge,
      featured: Boolean(p.featured),
      bestSeller: (badge || "").toLowerCase().includes("bestseller"),
      newArrival: (badge || "").toLowerCase() === "new",
      inStock: true,
      rating: 0,
      reviews: 0,
      warranty: "",
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

/* ---------------- public API ---------------- */
export async function getLiveCatalog(): Promise<{
  products: Product[];
  categories: CategoryMeta[];
}> {
  const { productsRaw, catsRaw } = await loadRaw();
  return buildCatalog(productsRaw, catsRaw);
}

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
