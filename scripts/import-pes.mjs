/**
 * import-pes.mjs
 * --------------
 * Imports the REAL Pearl Electric Solutions catalog from www.pespeshawar.pk
 * (via the public API, snapshotted into ./pes-data/*.json) into this site's
 * data layer. It regenerates:
 *
 *   src/data/products.ts   — every live product, remapped to the Product type
 *   src/data/categories.ts — the 13 real store categories (+ counts/images)
 *   src/data/site.ts       — real contact/branding/socials/hours/promos
 *
 * Product photos are HOTLINKED from https://api.pespeshawar.pk (per your
 * choice). To refresh later: replace files in scripts/pes-data/ and re-run.
 *
 * Run:  node scripts/import-pes.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "pes-data");
const root = join(here, "..");

const load = (f) => JSON.parse(readFileSync(join(dataDir, f), "utf8"));

const products = load("products.json"); // array
const categoriesRaw = load("categories.json").categories; // array
const settingsRaw = load("settings.json");

/* several settings fields arrive as JSON-encoded strings */
const parseMaybe = (v) => {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (!t.startsWith("[") && !t.startsWith("{")) return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
};
const settings = Object.fromEntries(
  Object.entries(settingsRaw).map(([k, v]) => [k, parseMaybe(v)])
);

const HOST = "https://api.pespeshawar.pk";
const abs = (p) => {
  if (!p) return "";
  return /^https?:\/\//.test(p) ? p : HOST + p;
};

/* ---------------- helpers ---------------- */
const slugify = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/[’'&]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "item";

const firstNumber = (s) => {
  const m = String(s ?? "").match(/(\d[\d,]*)/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
};

const clean = (s = "") =>
  String(s)
    .replace(/\u0000/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2013|\u2014/g, "-")
    .trim();

const sentence = (s) => {
  const t = clean(s);
  return t ? t : "";
};

/* split a description into "feature bullets" (separated by • , ·  or newlines) */
const bulletize = (text) => {
  if (!text) return [];
  return text
    .split(/[•·|\n]+/)
    .map((p) => clean(p))
    .filter((p) => p.length >= 6 && p.length <= 110)
    .slice(0, 8);
};

/* ---------------- per-category display metadata (design layer) ---------------- */
const CATEGORY_META = {
  "FAN": { icon: "fan", accent: "#d4af37", tagline: "Ceiling & bracket fans from Pakistan's top brands", description: "A wide range of ceiling fans and bracket fans from Royal, Pak Fan, Lahore Fan, Voldam and other trusted brands — energy-efficient copper-wound motors, quiet operation and genuine warranties." },
  "Exhaust Fans": { icon: "fan", accent: "#5aa7d6", tagline: "Kitchen, bath & industrial ventilation", description: "Exhaust fans for kitchens, bathrooms and workspaces — from compact 6\" plastic models to powerful metal ventilators that clear heat, steam and odours quickly." },
  "Lighting Solutions": { icon: "bulb", accent: "#f2c14e", tagline: "LED bulbs, panels & decorative lighting", description: "Energy-saving LED bulbs, battens, panels, floodlights and decorative fixtures from Philips, Opal and leading brands — bright, efficient and long-lasting." },
  "Wires & Cables": { icon: "wire", accent: "#c9894a", tagline: "Pakistan Cables, AGE, Fast & more", description: "Approved distributor of Pakistan Cables, AGE Cables and Fast Cables. House wiring, coaxial, and industrial cables with the lowest resistance and highest safety." },
  "Switches & Sockets": { icon: "switch", accent: "#4f9de0", tagline: "Clipsal, Schneider, ABB & genuine brands", description: "Premium switches, sockets and accessories from Clipsal, Schneider, ABB and others — from 1-gang to modular ranges, always 100% genuine." },
  "Circuit Breakers": { icon: "breaker", accent: "#5fd0a6", tagline: "MCBs, MCCBs, RCDs & change-overs", description: "Complete circuit protection — MCBs, MCCBs, RCDs and change-over switches from Chint and trusted manufacturers to keep every circuit safe." },
  "Distribution Boards (DBs)": { icon: "dbs", accent: "#d98e4a", tagline: "Load centres for every project", description: "Distribution boards and load centres in all sizes and designs — from 4-way to 18-way metal and Islamabad-design boards for homes and commercial projects." },
  "Solar Accessories": { icon: "solar", accent: "#f2c14e", tagline: "Solar gear for homes & industry", description: "Solar accessories including copper earthing rods, structure, and components to make your solar installation safe, earthed and reliable." },
  "Smart Home": { icon: "smart", accent: "#5aa7d6", tagline: "BlueDot switches & automation", description: "Smart-home solutions — WiFi switches, motion and microwave sensors that bring convenience, automation and security to your space." },
  "Conduites & Back Boxes": { icon: "conduit", accent: "#9aa7b8", tagline: "Conduit pipes, ducts & boxes", description: "Conduit pipes, slotted ducts, back boxes and switch boxes that keep wiring neat, safe and up to code." },
  "Shutters & Covers": { icon: "shutter", accent: "#7ec89b", tagline: "Exhaust shutters & covers", description: "Shutters and covers for exhaust fans and openings — durable, rust-resistant and available in multiple sizes." },
  "Earthing Accessories": { icon: "earthing", accent: "#b3922a", tagline: "Copper rods & grounding gear", description: "Earthing copper rods, clamps and accessories for safe, low-resistance grounding in every soil type." },
  "Others": { icon: "other", accent: "#8ab6f0", tagline: "Everyday electrical essentials", description: "The essentials that keep every electrician going — tapes, tools and everyday electrical accessories from the brands you trust." },
};

/* ---------------- build categories ---------------- */
const categoryImages = settings.categoryImages || {};
const catNameToSlug = new Map();

const categories = categoriesRaw
  .map((c) => {
    const name = clean(c.name);
    const slug = slugify(name);
    catNameToSlug.set(name, slug);
    const meta = CATEGORY_META[name] || {
      icon: "other",
      accent: "#8ab6f0",
      tagline: `${name}`,
      description: `Browse our full range of ${name.toLowerCase()} — genuine brands, fair prices and expert advice in store.`,
    };
    const count = products.filter((p) => slugify(p.category) === slug).length;
    const image = c.image
      ? abs(c.image)
      : categoryImages[name]
        ? abs(categoryImages[name])
        : (products.find((p) => slugify(p.category) === slug)?.image
            ? abs(products.find((p) => slugify(p.category) === slug).image)
            : "");
    return {
      id: slug,
      name,
      shortName: name.length > 18 ? meta.shortName || name : name,
      tagline: meta.tagline,
      description: meta.description,
      icon: meta.icon,
      accent: meta.accent,
      image,
      count,
    };
  })
  .sort((a, b) => {
    // keep the shop's own order first, then by count desc
    const order = [1, 2, 3, 5, 8, 4, 9, 11, 12, 13, 6, 7, 10];
    const ia = order.indexOf(
      categoriesRaw.find((c) => slugify(c.name) === a.id)?.id ?? 99
    );
    const ib = order.indexOf(
      categoriesRaw.find((c) => slugify(c.name) === b.id)?.id ?? 99
    );
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

/* ---------------- build products ---------------- */
const usedSlugs = new Set();
const buildProducts = () => {
  return products.map((p) => {
    const name = clean(p.name);
    let slug = slugify(name);
    let n = 2;
    const base = slug;
    while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
    usedSlugs.add(slug);

    const catName = clean(p.category);
    const category = catNameToSlug.get(catName) || slugify(catName);
    const price = firstNumber(p.price) ?? firstNumber(p.sale_price) ?? 0;
    const sale = p.on_sale
      ? firstNumber(p.sale_price)
      : null;
    const salePrice =
      sale !== null && sale > 0 && sale < price ? sale : undefined;

    const desc = sentence(p.desc);
    const features = bulletize(desc);
    const image = abs(p.image);
    const badge = clean(p.badge);
    const badgeText =
      badge && badge.toLowerCase() !== "sale" ? badge : undefined;
    const shortBadge = badgeText
      ? badgeText.length > 12
        ? badgeText
        : badgeText
      : p.on_sale && salePrice !== undefined
        ? "Sale"
        : undefined;

    // If the description only repeats the name, treat it as empty so the UI
    // can fall back to category copy instead of duplicating the title.
    const isDup =
      desc.replace(/\.+$/, "").trim().toLowerCase() ===
      name.trim().toLowerCase();
    const effectiveDesc = isDup ? "" : desc;

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
      images: [image],
      downloads: [],
      badge: shortBadge,
      featured: Boolean(p.featured),
      bestSeller: (badge || "").toLowerCase().includes("bestseller"),
      newArrival: (badge || "").toLowerCase() === "new",
      inStock: true,
      rating: 0,
      reviews: 0,
      warranty: "",
    };
  });
};

const built = buildProducts();

/* ---------------- write products.ts ---------------- */
const prodLines = built.map((p) => "  " + JSON.stringify(p));
const productsFile = `import type { Product } from "@/types";

/**
 * REAL Pearl Electric Solutions catalog — imported from www.pespeshawar.pk
 * (public API, ${built.length} products) by scripts/import-pes.mjs.
 * Product photos are hotlinked from the live backend (api.pespeshawar.pk).
 */
export const products: Product[] = [
${prodLines.join(",\n")},
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

/** Real badges/editorial picks mapped to site flags. */
export const featuredProducts = products.filter((p) => p.featured);
export const bestSellers = products.filter((p) => p.bestSeller);
export const newArrivals = products.filter((p) => p.newArrival);
export const onSale = products.filter((p) => p.salePrice !== undefined);

export const relatedProducts = (
  product: Product,
  count = 4
): Product[] =>
  products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, count);

/** N newest/featured products for the home page (falls back across categories). */
export function pickProducts(limit = 8, excludeSlugs: string[] = []): Product[] {
  const pool = [
    ...newArrivals,
    ...bestSellers,
    ...products.filter((p) => p.salePrice !== undefined),
    ...products,
  ];
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of pool) {
    if (seen.has(p.id) || excludeSlugs.includes(p.slug)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}
`;

writeFileSync(join(root, "src/data/products.ts"), productsFile);
console.log("✓ products.ts  →", built.length, "products");

/* ---------------- write categories.ts ---------------- */
const catLines = categories.map((c) => "  " + JSON.stringify(c));
const categoriesFile = `import type { CategoryMeta } from "@/types";

/**
 * REAL store categories — imported from www.pespeshawar.pk
 * (${categories.length} categories) by scripts/import-pes.mjs.
 */
export const categories: CategoryMeta[] = [
${catLines.join(",\n")},
];

export const categoryNavIds = [
  "fan",
  "exhaust-fans",
  "lighting-solutions",
  "wires-cables",
  "switches-sockets",
  "circuit-breakers",
];

export function getCategory(id: string): CategoryMeta | undefined {
  return categories.find((c) => c.id === id);
}

export function categoryLabel(id: string): string {
  return categories.find((c) => c.id === id)?.shortName ?? id;
}
`;

writeFileSync(join(root, "src/data/categories.ts"), categoriesFile);
console.log("✓ categories.ts →", categories.length, "categories");

/* ---------------- write promo banners ---------------- */
const normalizeLink = (link = "") => {
  // Their old site used /products/?category=<Raw Name> — map to slug-based query.
  return link.replace(/\bcategory=([^&]+)/, (_, v) => {
    return "category=" + slugify(decodeURIComponent(v));
  });
};
const promos = (settings.promoBanners || [])
  .filter((b) => b && (b.image || b.title))
  .slice(0, 4)
  .map((b) => ({
    title: clean(b.title || "PES Specials"),
    subtitle: clean(b.subtitle || ""),
    image: abs(b.image),
    link: normalizeLink(b.link || "/products"),
  }));

/* ---------------- write site.ts ---------------- */
const social = (settings.socialLinks || []).map((s) => ({
  name: clean(s.name),
  url: clean(s.url),
}));

const phoneDigits = (settings.whatsappNumber || "")
  .replace(/[^\d]/g, "");
const whatsapp = phoneDigits || settings.phone.replace(/[^\d]/g, "");

const site = {
  name: "Pearl Electric Solutions",
  shortName: "PES",
  shopName: clean(settings.shopName || "Pearl Electric"),
  tagline: clean(settings.footerTagline || "Bringing Light to Every Home"),
  description: clean(
    settings.siteDescription ||
      "Your trusted electrical supply shop in Peshawar. Quality products at affordable prices."
  ),
  logo: "/logo.svg",
  shopFront: abs(settings.shopFrontImage),
  phone: clean(settings.phone || "+92 323 5677090"),
  contactPhone: clean(settings.contactPhone || ""),
  whatsapp,
  email: clean(settings.contactEmail || settings.email || "info@pearlectrics.pk"),
  salesEmail: clean(settings.email || settings.contactEmail || "info@pearlectrics.pk"),
  address: clean(
    settings.address || "Shop No. 01, Haroon Market, Karkhano Bazar, Peshawar, Pakistan"
  ),
  contactAddress: clean(
    settings.contactAddress || "Shop #5, Khyber Bazaar, Peshawar, Pakistan"
  ),
  hours: clean(
    settings.workingHours || "Mon - Sat: 9:00 AM - 8:00 PM, Sun: Closed"
  ),
  hoursWeekdays: clean(settings.hoursWeekdays || "9:00 AM - 7:00 PM"),
  hoursSunday: clean(settings.hoursSunday || ""),
  hoursFriday: clean(settings.hoursFriday || ""),
  social: Object.fromEntries(
    ["facebook", "instagram", "whatsapp", "youtube", "linkedin", "twitter"].map(
      (k) => {
        const found = social.find(
          (s) => s.name.toLowerCase().includes(k) || k === "whatsapp" && s.name.toLowerCase().includes("whatsapp")
        );
        return [k, found ? found.url : ""];
      }
    )
  ),
  socialLinks: social,
  about: {
    heading: clean(settings.aboutHeading || "Peshawar's Most"),
    headingHighlight: clean(settings.aboutHeadingHighlight || "Trusted Electric Shop"),
    short: clean(settings.aboutUs || ""),
    p1: clean(settings.aboutDescription1 || ""),
    p2: clean(settings.aboutDescription2 || ""),
  },
  returnPolicy: clean(settings.returnPolicy || ""),
  deliveryInfo: clean(settings.deliveryInfo || ""),
  whatsappMessage: clean(settings.whatsappMessage || "Hi, I am interested in your products."),
  mapEmbed:
    "https://www.google.com/maps?q=" +
    encodeURIComponent("Karkhano Bazar, Peshawar, Pakistan") +
    "&output=embed",
  promoBanners: promos,
};

const siteFile = `import type { NavLink } from "@/types";
import { categories, categoryNavIds } from "./categories";

export const site = ${JSON.stringify(site, null, 2)} as const;

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" },
];

/** Primary categories surfaced in the navbar dropdown. */
export const categoryNavLinks: NavLink[] = categories
  .filter((c) => categoryNavIds.includes(c.id))
  .map((c) => ({ label: c.shortName, href: \`/products?category=\${c.id}\` }));
`;

writeFileSync(join(root, "src/data/site.ts"), siteFile);
console.log("✓ site.ts (contact/branding/promos imported)");

console.log("\nImport complete ✅  (products:", built.length, "| categories:", categories.length, ")");
