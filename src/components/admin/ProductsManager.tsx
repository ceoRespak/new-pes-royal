"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaChevronDown,
  FaChevronRight,
  FaEdit,
  FaImage,
  FaPlus,
  FaSearch,
  FaTags,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import UploadButton from "./UploadButton";
import { resolveImage } from "@/lib/images";

export interface AdminVariant {
  title?: string;
  label?: string;
  price?: string | number;
  sale_price?: string | number;
  salePrice?: string | number;
  image?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  desc?: string;
  price?: string;
  sale_price?: string;
  on_sale?: boolean;
  badge?: string | null;
  image?: string;
  category?: string | null;
  featured?: boolean;
  warranty?: string;
  features?: string[];
  specs?: Record<string, string>;
  downloads?: { label?: string; url?: string; size?: string }[];
  videos?: { label?: string; url?: string; link?: string }[];
  /** Multiple options for the same product, e.g. Standard / Premium / Pro. */
  variants?: AdminVariant[];
}

/* ----- textarea <-> structured helpers for the rich fields ----- */
const splitLines = (s: string): string[] =>
  String(s || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

function parseFeaturesText(s: string): string[] {
  return splitLines(s);
}

function parseSpecsText(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of splitLines(s)) {
    const eq = line.indexOf("=");
    if (eq > 0) out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    else out[line] = "";
  }
  return out;
}

function parseDownloadsText(
  s: string
): { label: string; url: string; size?: string }[] {
  return splitLines(s)
    .map((line) => {
      const parts = line.split("|").map((x) => x.trim());
      return { label: parts[0] ?? "", url: parts[1] ?? "", size: parts[2] || undefined };
    })
    .filter((d) => d.url);
}

function parseVideosText(
  s: string
): { label?: string; url?: string; link?: string }[] {
  const out: { label?: string; url?: string; link?: string }[] = [];
  for (const line of splitLines(s)) {
    const parts = line.split("|").map((x) => x.trim());
    const target = parts[1] ?? "";
    if (!target) continue;
    const isLink = /^https?:/i.test(target);
    out.push({
      label: parts[0] || undefined,
      link: isLink ? target : undefined,
      url: isLink ? undefined : target,
    });
  }
  return out;
}

interface Props {
  products: AdminProduct[];
  categories: string[];
}

const BADGES = ["", "Sale", "Top Brand", "New", "Bestseller"];

/** Per-category row sort options. */
type SortKey = "recent" | "name" | "price-asc" | "price-desc";

/** Deterministic accent per category (stays stable while browsing). */
const CAT_ACCENTS = [
  { bar: "from-[#002B6B] to-[#0047B3]", chip: "bg-[#002B6B]/10 text-[#002B6B]", dot: "bg-[#002B6B]" },
  { bar: "from-[#FF5A00] to-[#E04D00]", chip: "bg-[#FF5A00]/10 text-[#E04D00]", dot: "bg-[#FF5A00]" },
  { bar: "from-[#0047B3] to-[#1E5CB3]", chip: "bg-[#0047B3]/10 text-[#0047B3]", dot: "bg-[#0047B3]" },
  { bar: "from-[#FF7A1A] to-[#FF5A00]", chip: "bg-[#FF7A1A]/10 text-[#E04D00]", dot: "bg-[#FF7A1A]" },
  { bar: "from-[#001B45] to-[#002B6B]", chip: "bg-[#001B45]/10 text-[#001B45]", dot: "bg-[#001B45]" },
  { bar: "from-[#FF9A4D] to-[#FF5A00]", chip: "bg-[#FF5A00]/10 text-[#E04D00]", dot: "bg-[#FF7A1A]" },
  { bar: "from-[#0a4695] to-[#002B6B]", chip: "bg-[#0a4695]/10 text-[#0a4695]", dot: "bg-[#0a4695]" },
  { bar: "from-[#E04D00] to-[#C2410C]", chip: "bg-[#E04D00]/10 text-[#C2410C]", dot: "bg-[#E04D00]" },
];
function accentFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return CAT_ACCENTS[h % CAT_ACCENTS.length];
}

/** Extract the numeric part of a price string. */
const priceNum = (s?: string | number) =>
  Number(String(s ?? "").replace(/[^\d]/g, "")) || 0;

/** Image paths are stored locally — resolve for display. */
const toAbs = resolveImage;

interface FormState {
  name: string;
  desc: string;
  price: string;
  sale_price: string;
  on_sale: boolean;
  badge: string;
  image: string;
  category: string;
  featured: boolean;
  warranty: string;
  featuresText: string;
  specsText: string;
  downloadsText: string;
  videosText: string;
  variants: AdminVariant[];
}

const emptyForm = (categories: string[]): FormState => ({
  name: "",
  desc: "",
  price: "",
  sale_price: "",
  on_sale: true,
  badge: "Sale",
  image: "",
  category: categories[0] ?? "",
  featured: true,
  warranty: "",
  featuresText: "",
  specsText: "",
  downloadsText: "",
  videosText: "",
  variants: [],
});

function toForm(p: AdminProduct): FormState {
  return {
    name: p.name ?? "",
    desc: p.desc ?? "",
    price: p.price ?? "",
    sale_price: p.sale_price ?? "",
    on_sale: Boolean(p.on_sale),
    badge: p.badge ?? "",
    image: p.image ?? "",
    category: p.category ?? "",
    featured: Boolean(p.featured),
    warranty: p.warranty ?? "",
    featuresText: Array.isArray(p.features) ? p.features.join("\n") : "",
    specsText: p.specs
      ? Object.entries(p.specs)
          .map(([k, v]) => `${k} = ${v}`)
          .join("\n")
      : "",
    downloadsText: Array.isArray(p.downloads)
      ? p.downloads
          .map((d) => [d.label ?? "", d.url ?? "", d.size ?? ""].filter(Boolean).join(" | "))
          .join("\n")
      : "",
    videosText: Array.isArray(p.videos)
      ? p.videos
          .map((v) => [v.label ?? "", v.link ?? v.url ?? ""].filter(Boolean).join(" | "))
          .join("\n")
      : "",
    // backend/live display uses `label`; our editor uses `title`
    variants: (Array.isArray(p.variants) ? p.variants : []).map((v) => ({
      title: v.title ?? v.label ?? "",
      price: v.price != null ? String(v.price) : "",
      sale_price: v.sale_price != null ? String(v.sale_price) : "",
      image: v.image ?? "",
    })),
  };
}

export default function ProductsManager({ products, categories }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  /** "all" = every assigned category; otherwise a single category name. */
  const [activeCat, setActiveCat] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  /** Collapsed per-category sections (only used in the "all" view). */
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  /** Lazy-load: how many rows are shown per category. */
  const [shownPerCat, setShownPerCat] = useState<Record<string, number>>({});
  const PAGE = 12;
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(categories));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  /** Products per category (only over what this admin can see). */
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      const k = p.category ?? "";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [products]);

  /** Assigned categories that actually contain products, in given order. */
  const catsWithProducts = useMemo(
    () => categories.filter((c) => (catCounts.get(c) ?? 0) > 0),
    [categories, catCounts]
  );

  /** The categories rendered right now (single category or all). */
  const shownCats =
    activeCat === "all"
      ? catsWithProducts
      : catsWithProducts.filter((c) => c === activeCat);

  function matches(p: AdminProduct): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${p.name} ${p.category ?? ""} ${p.badge ?? ""}`
      .toLowerCase()
      .includes(q);
  }

  const sortProducts = (list: AdminProduct[]): AdminProduct[] => {
    const arr = [...list];
    if (sortKey === "name") return arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortKey === "price-asc")
      return arr.sort((a, b) => priceNum(a.price) - priceNum(b.price));
    if (sortKey === "price-desc")
      return arr.sort((a, b) => priceNum(b.price) - priceNum(a.price));
    // recent = newest id first
    return arr.sort(
      (a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)
    );
  };

  const itemsFor = (cat: string): AdminProduct[] =>
    sortProducts(
      products.filter((p) => (p.category ?? "") === cat && matches(p))
    );

  function limitFor(cat: string): number {
    return shownPerCat[cat] ?? PAGE;
  }
  function loadMore(cat: string) {
    setShownPerCat((s) => ({ ...s, [cat]: (s[cat] ?? PAGE) + PAGE }));
  }
  function toggleCat(cat: string) {
    setCollapsed((c) => ({ ...c, [cat]: !c[cat] }));
  }

  function openCreate(cat?: string) {
    setEditing(null);
    const preferred =
      cat && categories.includes(cat)
        ? cat
        : activeCat !== "all" && categories.includes(activeCat)
          ? activeCat
          : categories[0] ?? "";
    setForm({ ...emptyForm(categories), category: preferred });
    setCreating(true);
  }
  function openEdit(p: AdminProduct) {
    setCreating(false);
    setEditing(p);
    setForm(toForm(p));
  }
  function close() {
    setCreating(false);
    setEditing(null);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setVariant(i: number, patch: Partial<AdminVariant>) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    }));
  }
  function addVariant() {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { title: "", price: "", sale_price: "" }],
    }));
  }
  function removeVariant(i: number) {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, idx) => idx !== i),
    }));
  }

  async function uploadMedia(
    field: "downloadsText" | "videosText",
    defaultLabel: string
  ) {
    const accept =
      field === "downloadsText"
        ? "application/pdf,.pdf"
        : "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.url) {
          const current = form[field];
          set(field, `${current ? current + "\n" : ""}${defaultLabel} | ${json.url}`);
        } else {
          flash("err", json.error || "Upload failed");
        }
      } catch {
        flash("err", "Upload failed — try again.");
      }
    };
    input.click();
  }

  function flash(kind: "ok" | "err", text: string) {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 5000);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PUT" : "POST";
    try {
      const body = {
        ...form,
        features: parseFeaturesText(form.featuresText),
        specs: parseSpecsText(form.specsText),
        downloads: parseDownloadsText(form.downloadsText),
        videos: parseVideosText(form.videosText),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("err", json.error || "Save failed");
        setBusy(false);
        return;
      }
      flash("ok", editing ? "Product updated ✓" : "Product created ✓");
      close();
      router.refresh();
    } catch {
      flash("err", "Network error during save.");
    }
    setBusy(false);
  }

  async function remove(p: AdminProduct) {
    if (!window.confirm(`Delete "${p.name}"? This removes it from the live site.`))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("err", json.error || "Delete failed");
      } else {
        flash("ok", "Product deleted");
      }
      router.refresh();
    } catch {
      flash("err", "Network error during delete.");
    }
    setBusy(false);
  }

  const priceOf = (p: AdminProduct) => {
    const num = (s?: string) => Number((s || "").replace(/[^\d]/g, "")) || 0;
    const reg = num(p.price);
    const sale = num(p.sale_price);
    if (p.on_sale && sale) return `Rs ${sale.toLocaleString()}`;
    return reg ? `Rs ${reg.toLocaleString()}` : "—";
  };

  return (
    <div>
      {/* Summary header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 rounded-3xl bg-gradient-to-r from-[#002B6B] to-[#003D94] p-5 text-white shadow-sm">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/60">
            {activeCat === "all" ? "All categories" : activeCat}
          </p>
          <h2 className="font-display text-xl font-bold">
            Products{" "}
            <span className="text-white/50">
              ({products.length} · {catsWithProducts.length} categories)
            </span>
          </h2>
        </div>
        <button
          onClick={() => openCreate()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-bold text-white shadow transition hover:-translate-y-0.5"
        >
          <FaPlus /> Add product
          {activeCat !== "all" ? ` in ${activeCat}` : ""}
        </button>
      </div>

      {notice && (
        <p
          className={`mb-5 rounded-2xl px-4 py-2.5 text-sm font-semibold ${
            notice.kind === "ok"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* ---------- Category sidebar ---------- */}
        <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-64">
          <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
            <p className="px-2 pb-2 pt-1 text-[0.68rem] font-extrabold uppercase tracking-wider text-slate-400">
              Categories
            </p>
            <button
              onClick={() => setActiveCat("all")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                activeCat === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <FaTags className={activeCat === "all" ? "text-white/70" : "text-slate-400"} />
                All products
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
                  activeCat === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {products.length}
              </span>
            </button>

            <div className="mt-1.5 space-y-0.5">
              {catsWithProducts.map((c) => {
                const acc = accentFor(c);
                const active = activeCat === c;
                const count = catCounts.get(c) ?? 0;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                      active ? "bg-slate-100 text-primary" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${acc.dot}`} />
                    <span className="min-w-0 flex-1 truncate">{c}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.62rem] font-bold text-slate-500">
                      {count}
                    </span>
                  </button>
                );
              })}
              {catsWithProducts.length === 0 && (
                <p className="px-3 py-3 text-xs text-slate-400">
                  No categories with products yet.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* ---------- Grouped product list ---------- */}
        <div className="min-w-0 flex-1 space-y-5">
          {/* search + sort */}
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  activeCat === "all"
                    ? "Quick search across all categories…"
                    : `Search within ${activeCat}…`
                }
                className="w-full rounded-xl border border-slate-200 bg-light/50 py-2.5 pl-11 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none"
              />
            </label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-xl border border-slate-200 bg-light/50 px-3 py-2.5 text-sm font-semibold focus:border-primary focus:outline-none"
            >
              <option value="recent">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
            </select>
          </div>

          {shownCats.length === 0 && (
            <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-slate-400">
                {query
                  ? `No products match “${query}”.`
                  : "No products found in this category."}
              </p>
            </div>
          )}

          {shownCats.map((cat) => {
            const items = itemsFor(cat);
            const acc = accentFor(cat);
            const count = items.length;
            const total = catCounts.get(cat) ?? 0;
            const isCollapsed = !!collapsed[cat];
            const visible = items.slice(0, limitFor(cat));
            const hasMore = items.length > visible.length;
            return (
              <section
                key={cat}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
              >
                {/* Sticky-ish category header */}
                <div
                  className={`flex items-center gap-3 bg-gradient-to-r ${acc.bar} px-5 py-3.5 text-white`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 transition hover:bg-white/30"
                    title={isCollapsed ? "Expand category" : "Collapse category"}
                  >
                    {isCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-base font-bold leading-tight">
                      {cat}
                    </h3>
                    <p className="text-[0.68rem] text-white/75">
                      {total} product{total === 1 ? "" : "s"}
                      {query && count !== total ? ` · ${count} match search` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreate(cat)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold transition hover:bg-white/30"
                  >
                    <FaPlus /> Add in {cat}
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {visible.map((p) => {
                      const isOnSale = p.on_sale && priceNum(p.sale_price) > 0;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50/70 sm:px-5"
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {p.image ? (
                              <Image
                                src={toAbs(p.image)}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-slate-300">
                                <FaImage />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <p className="truncate font-semibold text-slate-700">
                                {p.name}
                              </p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${acc.chip}`}
                              >
                                {p.category || "Uncategorised"}
                              </span>
                              {p.badge && (
                                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-accent">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] text-slate-400">
                              <span className="font-bold text-primary">
                                {priceOf(p)}
                              </span>
                              {isOnSale && (
                                <span className="line-through">{p.price}</span>
                              )}
                              {p.on_sale && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600">
                                  On sale
                                </span>
                              )}
                              {p.featured && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
                                  Featured
                                </span>
                              )}
                              {Array.isArray(p.variants) &&
                                p.variants.length > 0 && (
                                  <span className="rounded-full bg-accent/15 px-2 py-0.5 font-bold text-accent">
                                    {p.variants.length} options
                                  </span>
                                )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary transition hover:bg-primary hover:text-white"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => remove(p)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {visible.length === 0 && (
                      <p className="px-5 py-8 text-center text-sm text-slate-400">
                        No products match your search in this category.
                      </p>
                    )}
                    {hasMore && (
                      <div className="flex justify-center px-4 py-3">
                        <button
                          type="button"
                          onClick={() => loadMore(cat)}
                          className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 transition hover:border-primary hover:text-primary"
                        >
                          Load more ({items.length - visible.length} more)
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {isCollapsed && (
                  <button
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className="block w-full px-5 py-3 text-center text-xs font-semibold text-slate-400 hover:bg-slate-50"
                  >
                    {count} product{count === 1 ? "" : "s"} hidden — click to expand
                  </button>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {(creating || editing) && (
        <div
          // The modal shell has a FIXED height (max-h = viewport). The header
          // and footer never move; only the middle (fields) scrolls. This keeps
          // every field + the Save button reachable at any viewport size.
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-primary/40 p-4 backdrop-blur-sm sm:p-6"
          onClick={close}
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* gradient header — fixed (never scrolls away) */}
            <div className="flex shrink-0 items-center justify-between gap-3 bg-gradient-to-r from-[#FF5A00] via-[#E04D00] to-[#C2410C] px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-lg backdrop-blur">
                  {editing ? <FaEdit /> : <FaPlus />}
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold leading-tight">
                    {editing ? "Edit product" : "Add new product"}
                  </h2>
                  <p className="text-[0.7rem] text-white/80">
                    {editing
                      ? "Update the product — changes save to the live store."
                      : "Create a product — it will appear in your store."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35"
              >
                <FaTimes />
              </button>
            </div>

            {/* scrollable body — only this middle section scrolls */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60">
            <div className="grid gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-7">
            {/* 1 · Basic details */}
            <div className="flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-indigo-700 sm:col-span-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[0.6rem] text-white">
                1
              </span>
              Basic details &amp; pricing
              <span className="h-px flex-1 bg-indigo-200" />
            </div>
            <label className="sm:col-span-2">
              <span className="field">Name *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="inp"
                  placeholder="e.g. Pak Fan 56 Delux Model Copper"
                />
              </label>

              <label className="block">
                <span className="field">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="inp"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="field">Badge</span>
                <select
                  value={form.badge}
                  onChange={(e) => set("badge", e.target.value)}
                  className="inp"
                >
                  {BADGES.map((b) => (
                    <option key={b || "none"} value={b}>
                      {b || "— no badge —"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="field">Price (Rs)</span>
                <input
                  required
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className="inp"
                  placeholder="9800"
                />
              </label>
              <label className="block">
                <span className="field">Sale price (Rs)</span>
                <input
                  value={form.sale_price}
                  onChange={(e) => set("sale_price", e.target.value)}
                  className="inp"
                  placeholder="9500"
                />
              </label>

              <div className="sm:col-span-2">
                <span className="field">Image URL</span>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={form.image}
                    onChange={(e) => set("image", e.target.value)}
                    className="inp"
                    placeholder="/storage/images/… or https://…"
                  />
                  <UploadButton
                    value={form.image}
                    onChange={(url) => set("image", url)}
                  />
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className="field">Description</span>
                <textarea
                  rows={3}
                  value={form.desc}
                  onChange={(e) => set("desc", e.target.value)}
                  className="inp resize-none"
                  placeholder="Short product description…"
                />
              </label>

              {/* 3 · Specs, brochure & video */}
              <div className="mt-2 rounded-2xl border-2 border-teal-200 bg-white p-4 shadow-sm sm:col-span-2">
                <div className="mb-3 flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-teal-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[0.6rem] text-white">
                    3
                  </span>
                  Specs, brochure &amp; video
                  <span className="h-px flex-1 bg-teal-200" />
                </div>

                <label className="block">
                  <span className="field !mb-0">Warranty</span>
                  <input
                    value={form.warranty}
                    onChange={(e) => set("warranty", e.target.value)}
                    className="inp"
                    placeholder="e.g. 1 Year Brand Warranty"
                  />
                </label>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="field !mb-0">Key features (one per line)</span>
                    <textarea
                      rows={3}
                      value={form.featuresText}
                      onChange={(e) => set("featuresText", e.target.value)}
                      className="inp resize-none"
                      placeholder={"Pure copper motor\nEnergy efficient"}
                    />
                  </label>
                  <label className="block">
                    <span className="field !mb-0">Technical specs (one per line: Key = Value)</span>
                    <textarea
                      rows={3}
                      value={form.specsText}
                      onChange={(e) => set("specsText", e.target.value)}
                      className="inp resize-none"
                      placeholder={"Blade size = 56 inch\nSpeed = 5 speeds"}
                    />
                  </label>
                  <label className="block">
                    <span className="field !mb-0">
                      Brochures / PDFs (one per line: Label | url)
                    </span>
                    <textarea
                      rows={3}
                      value={form.downloadsText}
                      onChange={(e) => set("downloadsText", e.target.value)}
                      className="inp resize-none"
                      placeholder={"Catalogue | /api/files/catalogue.pdf\nDatasheet | https://…/sheet.pdf"}
                    />
                  </label>
                  <label className="block">
                    <span className="field !mb-0">
                      Videos (one per line: Label | url or link)
                    </span>
                    <textarea
                      rows={3}
                      value={form.videosText}
                      onChange={(e) => set("videosText", e.target.value)}
                      className="inp resize-none"
                      placeholder={"Demo | /api/files/demo.mp4\nYouTube | https://youtu.be/xxxx"}
                    />
                  </label>
                </div>
                <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-xs leading-relaxed text-teal-700">
                  One entry per line: <b>Label | /api/files/… url</b> (or a full
                  https link). Upload a file to get a local url, or paste an
                  external link.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => uploadMedia("downloadsText", "Brochure")}
                    className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    ↑ Upload brochure (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => uploadMedia("videosText", "Product video")}
                    className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    ↑ Upload video (mp4)
                  </button>
                </div>
              </div>

              {/* Multiple variants */}
              <div className="mt-2 rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-sm sm:col-span-2">
                <div className="mb-3 flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-violet-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[0.6rem] text-white">
                    2
                  </span>
                  Options &amp; variants (optional)
                  <span className="h-px flex-1 bg-violet-200" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="field !mb-0">Multiple variants</span>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700"
                  >
                    <FaPlus /> Add variant
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  e.g. Standard / Premium / Pro, or different sizes — each with
                  its own title &amp; price.
                </p>

                {form.variants.length === 0 && (
                  <p className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
                    No variants — this is a single-price product.
                  </p>
                )}

                <div className="mt-3 space-y-3">
                  {form.variants.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                    >
                      <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                        <label className="col-span-2 sm:col-span-1">
                          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                            Title
                          </span>
                          <input
                            value={v.title ?? ""}
                            onChange={(e) => setVariant(i, { title: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                            placeholder="Standard"
                          />
                        </label>
                        <label>
                          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                            Price (Rs)
                          </span>
                          <input
                            value={v.price ?? ""}
                            onChange={(e) => setVariant(i, { price: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                            placeholder="12500"
                          />
                        </label>
                        <label>
                          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                            Sale (Rs)
                          </span>
                          <input
                            value={v.sale_price ?? ""}
                            onChange={(e) => setVariant(i, { sale_price: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                            placeholder="11900"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                          title="Remove variant"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          value={v.image ?? ""}
                          onChange={(e) => setVariant(i, { image: e.target.value })}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-primary"
                          placeholder="Variant image URL (optional)"
                        />
                        <UploadButton
                          value={v.image ?? ""}
                          onChange={(url) => setVariant(i, { image: url })}
                          label="Upload variant image"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.on_sale}
                    onChange={(e) => set("on_sale", e.target.checked)}
                    className="h-4 w-4 accent-violet-600"
                  />
                  On sale
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    className="h-4 w-4 accent-amber-500"
                  />
                  Featured
                </label>
              </div>
            </div>
            </div>

            {form.image && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-3">
                <Image
                  src={toAbs(form.image)}
                  alt="preview"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <p className="text-xs text-slate-400">Image preview</p>
              </div>
            )}

            {/* Footer actions — fixed, always visible */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={close}
                className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A00] to-[#C2410C] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#FF5A00]/25 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy ? "Saving…" : editing ? "Save changes" : "Create product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        .field {
          display: block;
          margin-bottom: 0.35rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #475569;
        }
        .inp {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 0.6rem 0.9rem;
          font-size: 0.875rem;
          color: #334155;
          outline: none;
          transition: all 0.15s;
        }
        .inp:focus {
          border-color: #002B6B;
          background: #fff;
        }
      `}</style>
    </div>
  );
}
