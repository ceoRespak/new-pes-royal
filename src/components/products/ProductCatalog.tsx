"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaTimes,
  FaSortAmountUp,
  FaSortAmountDown,
  FaThList,
  FaFire,
} from "react-icons/fa";
import type { Category, Product } from "@/types";
import ProductCard from "./ProductCard";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

interface ProductCatalogProps {
  products: Product[];
  initialCategory?: Category | "all";
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "name", label: "Name A–Z" },
];

export default function ProductCatalog({
  products,
  initialCategory = "all",
}: ProductCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">(initialCategory);
  const [sort, setSort] = useState<SortKey>("featured");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) =>
      map.set(p.category, (map.get(p.category) ?? 0) + 1)
    );
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (query.trim() === "" ||
          `${p.name} ${p.tagline} ${p.description}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()))
    );
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
  }, [products, category, query, sort]);

  const clearAll = () => {
    setQuery("");
    setCategory("all");
    setSort("featured");
  };

  const chips: Array<{ id: Category | "all"; label: string }> = [
    { id: "all", label: "All Products" },
    ...categories
      .filter((c) => c.count > 0)
      .map((c) => ({ id: c.id as Category, label: c.shortName })),
  ];

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

  return (
    <div>
      {/* Controls */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        {/* search + sort */}
        <div className="flex flex-col gap-4 md:flex-row">
          <label className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fans, LED lights, sensors, MCBs..."
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

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-light/50 px-4 py-2.5">
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
        </div>

        {/* category chips */}
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {chips.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
                category === c.id
                  ? "text-white"
                  : "bg-light text-slate-600 hover:bg-primary/10 hover:text-primary"
              )}
            >
              {category === c.id && (
                <motion.span
                  layoutId="cat-pill"
                  className="absolute inset-0 rounded-full bg-primary-gradient"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {c.label}
                {c.id !== "all" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.62rem] font-bold",
                      category === c.id
                        ? "bg-white/25 text-white"
                        : "bg-accent/15 text-accent"
                    )}
                  >
                    {counts.get(c.id) ?? 0}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* results header */}
      <div className="mb-6 mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-bold text-primary">{filtered.length}</span>{" "}
          product{filtered.length !== 1 && "s"}
          {category !== "all" && (
            <>
              {" "}
              in{" "}
              <span className="font-bold text-accent">
                {categories.find((c) => c.id === category)?.shortName}
              </span>
            </>
          )}
        </p>
        {(query || category !== "all" || sort !== "featured") && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary underline-offset-4 hover:underline"
          >
            <FaTimes /> Clear filters
          </button>
        )}
      </div>

      {/* grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-slate-200 bg-light py-24 text-center"
          >
            <p className="font-display text-xl font-bold text-primary">
              No matching products
            </p>
            <p className="mt-2 text-sm text-slate-500">
              We couldn&apos;t find anything for that search. Try another term.
            </p>
            <button onClick={clearAll} className="btn-primary mt-6">
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`${category}-${sort}-${query}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
