"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaFilter,
  FaFire,
  FaImage,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaThList,
  FaTimes,
} from "react-icons/fa";
import type { Category, CategoryMeta, Product } from "@/types";
import ProductCard from "./ProductCard";
import { categoryLabel } from "@/data/categories";
import { cn } from "@/lib/utils";

/** Number of products rendered before the "Load more" button appears. */
const PAGE_SIZE = 24;

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

interface ProductCatalogProps {
  products: Product[];
  initialCategory?: Category | "all";
  /** Brand slug to preselect (from /products?brand=<id>). */
  initialBrand?: string | null;
  /** Live category metadata (for display names). Falls back to the snapshot. */
  cats?: CategoryMeta[];
  /** Wide collection banner shown at the top of the main column. */
  bannerImage?: string;
  /** Accessible name for the banner. */
  bannerAlt?: string;
  /** Short label overlaid on the banner (e.g. the category short name). */
  bannerLabel?: string;
  /**
   * Admin-set images for the Shop-by-Type cards, keyed by
   * `<categoryId>::<typeId>` (falls back to a product image automatically).
   */
  subTypeImages?: Record<string, string>;
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "name", label: "Name A–Z" },
];

type PresetId = "u500" | "500-1k" | "1k-5k" | "5k-20k" | "20k+";
const PRICE_PRESETS: {
  id: PresetId;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "u500", label: "Under Rs 500", min: 0, max: 499 },
  { id: "500-1k", label: "Rs 500 – 1,000", min: 500, max: 1000 },
  { id: "1k-5k", label: "Rs 1,000 – 5,000", min: 1001, max: 5000 },
  { id: "5k-20k", label: "Rs 5,000 – 20,000", min: 5001, max: 20000 },
  { id: "20k+", label: "Rs 20,000 +", min: 20001, max: Number.POSITIVE_INFINITY },
];

export default function ProductCatalog({
  products,
  initialCategory = "all",
  initialBrand,
  cats,
  bannerImage,
  bannerAlt,
  bannerLabel,
  subTypeImages,
}: ProductCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">(initialCategory);
  const [brand, setBrand] = useState<string | null>(initialBrand ?? null);
  const [sub, setSub] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [pricePreset, setPricePreset] = useState<PresetId | null>(null);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  /** Mobile only: expand the filter panel above the results. */
  const [showFilters, setShowFilters] = useState(false);

  // Resolve the active price range (preset OR custom min/max inputs).
  const activeRange = useMemo<{ min: number; max: number } | null>(() => {
    if (pricePreset) {
      const p = PRICE_PRESETS.find((x) => x.id === pricePreset);
      if (p) return { min: p.min, max: p.max };
    }
    const min = priceMin === "" ? null : Number(priceMin);
    const max = priceMax === "" ? null : Number(priceMax);
    if (min === null && max === null) return null;
    return { min: min ?? 0, max: max ?? Number.POSITIVE_INFINITY };
  }, [pricePreset, priceMin, priceMax]);

  // Category counts — scoped by the active brand so the list stays useful when
  // a brand is selected (e.g. only Opal's categories are listed).
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    products
      .filter((p) => !brand || p.brand?.id === brand)
      .forEach((p) => map.set(p.category, (map.get(p.category) ?? 0) + 1));
    return map;
  }, [products, brand]);

  const scopeTotal = useMemo(
    () => products.filter((p) => !brand || p.brand?.id === brand).length,
    [products, brand]
  );

  // Brand list (auto-detected) derived from the actual products — scoped to
  // the active category so a brand pick can never return an empty page.
  const brandList = useMemo(() => {
    const m = new Map<string, { id: string; name: string; count: number }>();
    products
      .filter((p) => category === "all" || p.category === category)
      .forEach((p) => {
        if (!p.brand) return;
        const e = m.get(p.brand.id);
        if (e) e.count += 1;
        else m.set(p.brand.id, { id: p.brand.id, name: p.brand.name, count: 1 });
      });
    return [...m.values()].sort((a, b) => b.count - a.count);
  }, [products, category]);

  // Sub-category options for the active category (plus "Other" for leftovers).
  // Each card gets an image: admin override (if set) else the first product
  // that belongs to that type.
  const subChips = useMemo(() => {
    if (category === "all") return [];
    const scope = products.filter(
      (p) => p.category === category && (!brand || p.brand?.id === brand)
    );
    const m = new Map<
      string,
      { id: string; name: string; count: number; image?: string }
    >();
    const firstImg: Record<string, string> = {};
    let matched = 0;
    let otherImg = "";
    scope.forEach((p) => {
      if (!p.sub) {
        if (!otherImg && p.images[0]) otherImg = p.images[0];
        return;
      }
      matched += 1;
      if (!firstImg[p.sub.id] && p.images[0]) firstImg[p.sub.id] = p.images[0];
      const e = m.get(p.sub.id);
      if (e) e.count += 1;
      else m.set(p.sub.id, { id: p.sub.id, name: p.sub.name, count: 1 });
    });
    const overrides = subTypeImages ?? {};
    const arr = [...m.values()]
      .sort((a, b) => b.count - a.count)
      .map((s) => ({
        ...s,
        image: overrides[`${category}::${s.id}`] || firstImg[s.id],
      }));
    const other = scope.length - matched;
    if (other > 0)
      arr.push({
        id: "other",
        name: "Other",
        count: other,
        image: overrides[`${category}::other`] || otherImg,
      });
    return arr;
  }, [products, category, brand, subTypeImages]);

  // Reset pagination whenever filters change.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [category, sort, query, brand, sub, pricePreset, priceMin, priceMax]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (brand && p.brand?.id !== brand) return false;
      if (category !== "all") {
        if (p.category !== category) return false;
        if (sub === "other") {
          if (p.sub) return false;
        } else if (sub && p.sub?.id !== sub) return false;
      }
      if (
        query.trim() !== "" &&
        !`${p.name} ${p.tagline} ${p.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
        return false;
      if (activeRange) {
        const eff = p.salePrice ?? p.price;
        if (eff < activeRange.min || eff > activeRange.max) return false;
      }
      return true;
    });
    switch (sort) {
      case "price-asc":
        list = [...list].sort(
          (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
        );
        break;
      case "price-desc":
        list = [...list].sort(
          (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
        );
        break;
      case "name":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list = [...list].sort((a, b) => {
          const fav = Number(b.featured ?? false) - Number(a.featured ?? false);
          return fav !== 0 ? fav : b.rating - a.rating;
        });
    }
    return list;
  }, [products, category, brand, sub, query, sort, activeRange]);

  const clearAll = () => {
    setQuery("");
    setCategory("all");
    setBrand(null);
    setSub(null);
    setSort("featured");
    setPricePreset(null);
    setPriceMin("");
    setPriceMax("");
  };

  const labelFor = (id: string): string =>
    cats?.find((c) => c.id === id)?.shortName ?? categoryLabel(id);

  const anyFilter =
    query !== "" ||
    category !== "all" ||
    brand !== null ||
    sub !== null ||
    pricePreset !== null ||
    priceMin !== "" ||
    priceMax !== "";

  const catRows: Array<{ id: Category | "all"; label: string; count: number }> =
    [
      { id: "all", label: "All Products", count: scopeTotal },
      ...[...counts.entries()]
        .filter(([, c]) => c > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => ({
          id: id as Category,
          label: labelFor(id),
          count: counts.get(id) ?? 0,
        })),
    ];

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;
  const from = filtered.length === 0 ? 0 : 1;
  const to = Math.min(visible, filtered.length);

  const sortIcon =
    sort === "price-desc" ? (
      <FaSortAmountDown />
    ) : sort === "price-asc" ? (
      <FaSortAmountUp />
    ) : sort === "name" ? (
      <FaThList />
    ) : (
      <FaFire />
    );

  const searchInput = (compact = false) => (
    <label className={cn("relative block", compact ? "" : "w-full")}>
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        className="w-full rounded-full border border-slate-200 bg-light/50 py-3 pl-11 pr-10 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
        >
          <FaTimes />
        </button>
      )}
    </label>
  );

  const sideSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="border-t border-slate-100 py-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2.5 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </h3>
      {children}
    </div>
  );

  const sidebar = (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:sticky lg:top-32">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-slate-900">
          <FaFilter className="text-primary" /> Filters
        </h2>
        {anyFilter && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-wider text-primary hover:underline"
          >
            <FaTimes /> Clear
          </button>
        )}
      </div>

      <div className="hidden lg:block">{searchInput()}</div>

      {sideSection({
        title: "Category",
        children: (
          <ul className="no-scrollbar max-h-72 space-y-1 overflow-y-auto pr-1">
            {catRows.map((r) => {
              const active = category === r.id;
              return (
                <li key={r.id}>
                  <button
                    onClick={() => {
                      setCategory(r.id);
                      setSub(null);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[0.82rem] font-semibold transition",
                      active
                        ? "bg-primary-gradient text-white shadow-sm"
                        : "text-slate-600 hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <span className="truncate">{r.label}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 text-[0.65rem] font-bold",
                        active
                          ? "bg-white/25 text-white"
                          : "bg-accent/15 text-accent"
                      )}
                    >
                      {r.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ),
      })}

      {brandList.length > 0 &&
        sideSection({
          title: "Brand",
          children: (
            <ul className="no-scrollbar max-h-64 space-y-1 overflow-y-auto pr-1">
              {brandList.map((b) => {
                const active = brand === b.id;
                return (
                  <li key={b.id}>
                    <button
                      onClick={() => {
                        setBrand(active ? null : b.id);
                        setSub(null);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[0.82rem] font-semibold transition",
                        active
                          ? "bg-primary-gradient text-white shadow-sm"
                          : "text-slate-600 hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <span className="truncate">{b.name}</span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 text-[0.65rem] font-bold",
                          active
                            ? "bg-white/25 text-white"
                            : "bg-accent/15 text-accent"
                        )}
                      >
                        {b.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ),
        })}

      {sideSection({
        title: "Price",
        children: (
          <div>
            <div className="space-y-1">
              {PRICE_PRESETS.map((p) => {
                const active = pricePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPricePreset(active ? null : p.id);
                      setPriceMin("");
                      setPriceMax("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[0.82rem] font-semibold transition",
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border-2 transition",
                        active
                          ? "border-white bg-accent"
                          : "border-slate-300 bg-white"
                      )}
                    >
                      {active && <FaCheck className="text-[0.5rem] text-white" />}
                    </span>
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                value={priceMin}
                onChange={(e) => {
                  setPricePreset(null);
                  setPriceMin(e.target.value.replace(/[^\d]/g, ""));
                }}
                placeholder="Min Rs"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 outline-none transition focus:border-primary"
              />
              <span className="text-xs text-slate-400">–</span>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={(e) => {
                  setPricePreset(null);
                  setPriceMax(e.target.value.replace(/[^\d]/g, ""));
                }}
                placeholder="Max Rs"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 outline-none transition focus:border-primary"
              />
            </div>
          </div>
        ),
      })}
    </div>
  );

  return (
    <div>
      {/* Mobile toolbar: search + sort + filter toggle */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center lg:hidden">
        <div className="relative flex-1">{searchInput()}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition sm:flex-none",
              showFilters
                ? "bg-primary-gradient text-white"
                : "border border-slate-200 bg-white text-primary"
            )}
          >
            <FaFilter /> Filters
            {anyFilter && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
          </button>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2">
            {sortIcon}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* ============ Filter sidebar ============ */}
        <aside
          className={cn(
            "mb-6 lg:mb-0",
            showFilters ? "block" : "hidden",
            "lg:block"
          )}
        >
          {sidebar}
        </aside>

        {/* ============ Main column ============ */}
        <div className="min-w-0">
          {/* Collection banner — sits at the very top of the main column,
              directly under the title (like the reference page). */}
          {bannerImage && (
            <div className="relative overflow-hidden rounded-3xl shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerImage}
                alt={bannerAlt || bannerLabel || "Collection"}
                className="h-40 w-full object-cover sm:h-48 md:h-56 lg:h-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/35 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4 sm:p-6">
                {bannerLabel && (
                  <div>
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.25em] text-white/70">
                      Collection
                    </p>
                    <p className="mt-0.5 font-display text-xl font-extrabold text-white drop-shadow sm:text-2xl">
                      {bannerLabel}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop toolbar is integrated into the sidebar (search) and the
              results header (sort) — nothing sits between banner and content. */}

          {/* Sub-category image cards (mirrors the reference page) */}
          {category !== "all" && subChips.length > 0 && (
            <div className="mb-5 mt-5">
              <h3 className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Shop by type
              </h3>
              <div className="no-scrollbar -mx-1 flex gap-3.5 overflow-x-auto px-1 pb-2">
                {subChips.map((s) => {
                  const active = sub === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSub(active ? null : s.id)}
                      className={cn(
                        "group relative w-[126px] shrink-0 snap-start overflow-hidden rounded-2xl border-2 text-left transition sm:w-[140px]",
                        active
                          ? "border-primary shadow-md ring-2 ring-primary/25"
                          : "border-slate-200 hover:border-primary/40 hover:shadow-sm"
                      )}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                        {s.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.image}
                            alt={s.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-slate-300">
                            <FaImage className="text-2xl" />
                          </span>
                        )}
                        {/* count badge */}
                        <span
                          className={cn(
                            "absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold shadow",
                            active ? "bg-primary text-white" : "bg-white text-slate-600"
                          )}
                        >
                          {s.count}
                        </span>
                        {/* name label */}
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/45 to-transparent px-2 pb-1.5 pt-5 text-[0.68rem] font-extrabold leading-tight text-white">
                          {s.name}
                        </span>
                        {active && (
                          <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[0.55rem] text-white">
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {filtered.length === 0 ? (
                <>0 products</>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-bold text-primary">
                    {from}–{to}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-primary">
                    {filtered.length}
                  </span>{" "}
                  product{filtered.length !== 1 && "s"}
                </>
              )}
              {category !== "all" && (
                <>
                  {" "}
                  in{" "}
                  <span className="font-bold text-accent">
                    {labelFor(category)}
                  </span>
                </>
              )}
              {brand && (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-bold text-primary">
                    {brandList.find((b) => b.id === brand)?.name}
                  </span>
                </>
              )}
              {category !== "all" && sub && (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-bold text-slate-600">
                    {subChips.find((s) => s.id === sub)?.name ?? "Other"}
                  </span>
                </>
              )}
            </p>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 lg:flex">
              {sortIcon}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort products"
                className="cursor-pointer bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {anyFilter && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary underline-offset-4 hover:underline lg:hidden"
              >
                <FaTimes /> Clear filters
              </button>
            )}
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center"
              >
                <p className="font-display text-xl font-bold text-primary">
                  No matching products
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  We couldn&apos;t find anything for that search. Try another
                  term or reset the filters.
                </p>
                <button onClick={clearAll} className="btn-primary mt-6">
                  Reset Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`${category}-${brand}-${sub}-${sort}-${query}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              >
                {shown.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load more */}
          {hasMore && (
            <div className="mt-10 flex flex-col items-center gap-2">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="inline-flex items-center rounded-full border-2 border-primary/15 px-8 py-3.5 text-sm font-bold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white"
              >
                Load More Products
              </button>
              <p className="text-xs text-slate-400">
                Showing {to} of {filtered.length} — {filtered.length - to} more
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
