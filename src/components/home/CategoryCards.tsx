"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import type { CategoryMeta } from "@/types";
import { categories as snapshotCategories } from "@/data/categories";

interface CategoryCardsProps {
  cats?: CategoryMeta[];
}

/**
 * Compact, auto-scrolling category marquee.
 *
 * Categories are small pills that scroll in one horizontal row and loop
 * seamlessly — so the section stays small even as the catalog grows to 100+
 * categories. Hovering pauses the scroll. Users who prefer reduced motion get
 * a normal manually-scrollable row instead (no duplicated content).
 */
export default function CategoryCards({ cats }: CategoryCardsProps) {
  // Respect admin sort order (categories already come sorted by `sort_order`);
  // just hide empty categories.
  const items = (cats ?? snapshotCategories).filter((c) => c.count > 0);

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (items.length === 0) return null;

  const pill = (cat: CategoryMeta, i: number, dup: boolean) => (
    <Link
      key={`${cat.id}-${dup ? "b" : "a"}`}
      href={`/products?category=${cat.id}`}
      tabIndex={dup ? -1 : undefined}
      aria-hidden={dup}
      className="group flex min-w-max items-center gap-2.5 rounded-2xl border border-slate-200 bg-white py-2 pl-3 pr-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#E11D2A]/40 hover:shadow-md"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[0.65rem] font-extrabold uppercase text-white"
        style={{ background: cat.accent ?? "#003366" }}
      >
        {cat.shortName.slice(0, 2)}
      </span>
      <span className="text-left">
        <span className="block max-w-[10rem] truncate text-sm font-bold leading-tight text-slate-800 group-hover:text-[#E11D2A]">
          {cat.shortName}
        </span>
        <span className="block text-[0.66rem] font-semibold text-slate-400">
          {cat.count} item{cat.count === 1 ? "" : "s"}
        </span>
      </span>
    </Link>
  );

  return (
    <section className="border-y border-slate-100 bg-light/40 py-8 md:py-12">
      <div className="container-px">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#E11D2A]">
              Shop by Category
            </p>
            <h2 className="font-display text-xl font-extrabold text-slate-900 md:text-2xl">
              Popular Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-[#E11D2A] transition hover:gap-3"
          >
            View All Categories
            <FaArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {reduced ? (
        <div className="container-px">
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {items.map((c) => pill(c, 0, false))}
          </div>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-light/60 to-transparent sm:w-16"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-light/60 to-transparent sm:w-16"
          />
          <div className="marquee-track flex w-max items-center gap-3 px-2">
            {items.map((c, i) => pill(c, i, false))}
            {items.map((c, i) => pill(c, i, true))}
          </div>
        </div>
      )}
    </section>
  );
}
