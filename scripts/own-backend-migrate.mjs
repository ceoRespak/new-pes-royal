#!/usr/bin/env node
/**
 * One-time migration: import the current catalog from the old backend into
 * this site's OWN self-hosted store and download every image locally.
 *
 *   node scripts/own-backend-migrate.mjs
 *
 * What it does
 *  - reads categories + products (full, per-category) + settings from
 *    api.pespeshawar.pk  (ONLY used during this migration — never at runtime)
 *  - downloads every referenced image into  /.data/uploads/  under its
 *    ORIGINAL filename (so legacy "/storage/images/<name>" urls translate)
 *  - writes  /.data/store.json   { products, categories, settings }
 *  - rewrites remote image urls -> "/api/files/<name>" inside the static
 *    fallbacks (src/data/products.ts, categories.ts, site.ts) too
 *
 * Safe to re-run: it overwrites .data/store.json and skips already-downloaded
 * files.
 */
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, ".data");
const UPLOADS = join(DATA_DIR, "uploads");
const STORE = join(DATA_DIR, "store.json");
const API = "https://api.pespeshawar.pk";

mkdirSync(UPLOADS, { recursive: true });

const CONCURRENCY = 6;
const downloaded = new Set(); // basenames already saved
const failed = new Set(); // remote urls that failed (kept as absolute fallback)

async function getJson(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(25_000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

function imageNameFromUrl(url) {
  try {
    const u = new URL(url);
    const name = basename(u.pathname);
    return name.replace(/[^a-zA-Z0-9._-]/g, "-");
  } catch {
    return null;
  }
}

/** The old API stores relative /storage/images/<name> paths. */
function toRemote(raw) {
  const s = String(raw ?? "");
  if (/^\/storage\/images\//.test(s)) return `${API}${s}`;
  return s;
}

async function download(url) {
  const original = String(url ?? "");
  // Already self-hosted (or a local placeholder like /images/...) → keep.
  if (/^\/api\/files\//.test(original)) return original;
  if (/^\//.test(original) && !/^\/storage\//.test(original)) return original;

  const remote = toRemote(original);
  try {
    const u = new URL(remote);
    if (u.hostname !== new URL(API).hostname) return original; // don't fetch other hosts
    const name = imageNameFromUrl(remote);
    if (!name) return original;
    const target = join(UPLOADS, name);
    if (!downloaded.has(name) && !existsSync(target)) {
      const res = await fetch(remote, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(target, buf);
    }
    downloaded.add(name);
    return `/api/files/${name}`;
  } catch (e) {
    failed.add(original);
    console.warn("  ! image failed, keeping original:", original, "–", String(e).slice(0, 80));
    return original;
  }
}

/* crawl objects/arrays and download+rewrite every /storage or remote image */
async function rewriteImages(value) {
  if (typeof value === "string") {
    if (
      /^\/storage\/images\//.test(value) ||
      /https?:\/\/api\.pespeshawar\.pk\/storage/.test(value)
    ) {
      return await download(value);
    }
    return value;
  }
  if (Array.isArray(value)) {
    const out = [];
    for (const v of value) out.push(await rewriteImages(v));
    return out;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = await rewriteImages(v);
    return out;
  }
  return value;
}

async function main() {
  console.log("Migrating catalog from", API, "→ local store + self-hosted images\n");

  // categories
  const catsJson = await getJson(`${API}/api/categories`);
  const rawCats = Array.isArray(catsJson) ? catsJson : catsJson.categories || [];
  console.log(`categories: ${rawCats.length}`);

  // full product set via per-category fetch (the flat endpoint caps at 10/cat)
  const flat = await getJson(`${API}/api/products`).catch(() => []);
  const byId = new Map();
  for (const p of flat || []) if (p?.id != null) byId.set(String(p.id), p);
  for (const cat of rawCats) {
    try {
      const list = await getJson(`${API}/api/products?category=${encodeURIComponent(cat.name)}`);
      for (const p of list || []) if (p?.id != null) byId.set(String(p.id), p);
    } catch (e) {
      console.warn("  skip category fetch", cat.name, String(e).slice(0, 60));
    }
  }
  const rawProducts = [...byId.values()];
  console.log(`products: ${rawProducts.length}`);

  // settings snapshot
  let settings = null;
  try {
    settings = await getJson(`${API}/api/settings`);
  } catch {
    console.warn("  settings not available — leaving null");
  }

  // download product images (pooled)
  console.log("\ndownloading product images…");
  const imgJobs = rawProducts.map((p) => String(p?.image ?? "")).filter(Boolean);
  for (let i = 0; i < imgJobs.length; i += CONCURRENCY) {
    await Promise.all(imgJobs.slice(i, i + CONCURRENCY).map((u) => download(u).catch(() => u)));
  }
  console.log(`  saved ${downloaded.size} images`);

  // rewrite stored payloads (products/categories/settings images -> /api/files)
  const products = [];
  for (const p of rawProducts) {
    const rewritten = await rewriteImages(p);
    products.push({
      id: String(rewritten.id ?? Date.now()),
      name: String(rewritten.name ?? ""),
      desc: String(rewritten.desc ?? ""),
      price: rewritten.price != null ? String(rewritten.price) : "",
      sale_price: rewritten.sale_price != null && rewritten.sale_price !== "" ? String(rewritten.sale_price) : null,
      on_sale: Boolean(rewritten.on_sale),
      badge: rewritten.badge ?? null,
      image: rewritten.image ?? null,
      category: rewritten.category ?? null,
      featured: Boolean(rewritten.featured),
      created_at: rewritten.created_at ?? null,
    });
  }
  const categories = [];
  for (const c of rawCats) {
    const rewritten = await rewriteImages(c);
    categories.push({
      id: String(rewritten.id ?? Date.now()),
      name: String(rewritten.name ?? ""),
      image: rewritten.image ?? undefined,
      sort_order: Number(rewritten.sort_order ?? 0),
    });
  }
  const settingsLocal = settings ? await rewriteImages(settings) : null;

  writeFileSync(STORE, JSON.stringify({ products, categories, settings: settingsLocal }, null, 2));
  console.log(`\nwrote ${STORE} (${products.length} products, ${categories.length} categories)`);
  if (failed.size) console.warn(`\n⚠ ${failed.size} images kept remote (failed to download).`);

  // rewrite static fallback data files so they serve local images too
  const dataFiles = [
    "src/data/products.ts",
    "src/data/categories.ts",
    "src/data/site.ts",
  ];
  console.log("\nrewriting static fallback image urls…");
  for (const rel of dataFiles) {
    const file = join(ROOT, rel);
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    const next = text
      .replace(/https:\/\/api\.pespeshawar\.pk\/storage\/images\//g, "/api/files/")
      .replace(/\/storage\/images\//g, "/api/files/");
    if (next !== text) {
      writeFileSync(file, next);
      console.log("  patched", rel);
    }
  }

  // Backfill: download any /api/files/<name> referenced by static data that
  // wasn't covered by product/category/settings (e.g. promo-banner defaults in
  // data/site.ts). Fetches them once from the old storage under the SAME name.
  console.log("\nbackfilling missing self-hosted images referenced by static data…");
  let backfilled = 0;
  const names = new Set();
  for (const rel of [...dataFiles, "src/data/about.ts", "src/data/hero.ts"]) {
    const file = join(ROOT, rel);
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    const re = /\/api\/files\/([A-Za-z0-9._-]+)/g;
    let m;
    while ((m = re.exec(text))) names.add(m[1]);
  }
  for (const name of names) {
    const target = join(UPLOADS, name);
    if (downloaded.has(name) || existsSync(target)) continue;
    try {
      const res = await fetch(`${API}/storage/images/${encodeURIComponent(name)}`, {
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(target, buf);
      downloaded.add(name);
      backfilled += 1;
      console.log("  +", name);
    } catch {
      console.warn("  ! could not backfill", name);
    }
  }
  if (backfilled) console.log(`backfilled ${backfilled} extra image(s)`);
  console.log("\nDone. Restart the dev server to reload the local store.");
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
