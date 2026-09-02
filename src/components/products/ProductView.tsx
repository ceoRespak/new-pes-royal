"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaShieldAlt,
  FaTruck,
  FaUndo,
} from "react-icons/fa";
import type { Product, CategoryMeta } from "@/types";
import ProductBuyPanel from "./ProductBuyPanel";
import RatingStars from "@/components/ui/RatingStars";
import { categoryLabel } from "@/data/categories";
import { cn, formatPrice } from "@/lib/utils";

const API_ORIGIN = "https://api.pespeshawar.pk";
const toAbs = (src?: string) =>
  !src ? "" : /^https?:\/\//.test(src) ? src : `${API_ORIGIN}${src}`;

const toNum = (v: string | number | undefined): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

interface Props {
  product: Product;
  category?: CategoryMeta | null;
}

const serviceItems = [
  { icon: FaShieldAlt, label: "100% genuine" },
  { icon: FaTruck, label: "Same-day delivery in Peshawar" },
  { icon: FaUndo, label: "7-day returns" },
];

/**
 * Product top section (gallery + buy area). When the product has multiple
 * variants, the FIRST variant is shown by default and the main image changes
 * when you select the 2nd / 3rd variant.
 */
export default function ProductView({ product, category }: Props) {
  const variants = product.variants ?? [];
  const [idx, setIdx] = useState(0);
  const safeIdx = variants.length ? Math.min(idx, variants.length - 1) : 0;
  const activeVariant = variants[safeIdx];
  const activeUnit = activeVariant
    ? toNum(activeVariant.salePrice ?? activeVariant.price)
    : null;

  const mainImage =
    (activeVariant?.image ? toAbs(activeVariant.image) : null) ??
    product.images[0];

  // Thumbnails: one per variant (falls back to the product image).
  const thumbs = variants.length
    ? variants.map((v) => ({
        label: v.label,
        price: toNum(v.salePrice ?? v.price),
        src: v.image ? toAbs(v.image) : product.images[0],
      }))
    : [];

  const catName = categoryLabel(product.category);
  const longDesc =
    product.description ||
    category?.description ||
    `Genuine ${catName} product available at Pearl Electric Solutions, Peshawar.`;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Main image + variant picker */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-primary/5">
          <Image
            key={mainImage}
            src={mainImage}
            alt={`${product.name}${activeVariant ? ` — ${activeVariant.label}` : ""}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-6"
          />
          {variants.length > 0 && activeVariant && (
            <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              {activeVariant.label}
              {activeUnit != null ? ` · ${formatPrice(activeUnit)}` : ""}
            </span>
          )}
        </div>

        {thumbs.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Select option — image &amp; price update
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {thumbs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "group rounded-2xl border-2 p-1.5 text-left transition",
                    i === safeIdx
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-slate-200 hover:border-primary/40"
                  )}
                >
                  <span className="relative block aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={t.src}
                      alt={t.label}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-1.5 block truncate px-1 text-[0.7rem] font-bold text-slate-600">
                    {t.label}
                  </span>
                  {t.price != null && (
                    <span className="block px-1 pb-1 text-[0.65rem] font-semibold text-primary">
                      {formatPrice(t.price)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <Link
          href={`/products?category=${product.category}`}
          className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-white"
        >
          {catName}
        </Link>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-primary md:text-4xl">
          {product.name}
        </h1>
        {(product.tagline || category?.tagline) && (
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            {product.tagline || category?.tagline}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {product.reviews > 0 && (
            <>
              <RatingStars rating={product.rating} size="md" />
              <span className="text-sm text-slate-400">
                {product.rating} · {product.reviews} reviews
              </span>
            </>
          )}
          {product.badge && (
            <span className="rounded-full bg-accent px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
              {product.badge}
            </span>
          )}
          {product.inStock && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[0.68rem] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              In Stock
            </span>
          )}
        </div>

        {/* Price row — follows the selected variant */}
        {(() => {
          const unit = activeUnit ?? product.salePrice ?? product.price;
          const regular =
            activeVariant && toNum(activeVariant.price) != null
              ? (toNum(activeVariant.price) as number)
              : product.salePrice
                ? product.price
                : unit;
          return (
            <div className="mt-6 flex items-end gap-3 border-b border-slate-100 pb-6">
              <p className="font-display text-4xl font-extrabold text-primary">
                {formatPrice(unit)}
              </p>
              {regular > unit && (
                <>
                  <p className="pb-1 text-lg text-slate-400 line-through">
                    {formatPrice(regular)}
                  </p>
                  <span className="mb-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                    Save {formatPrice(regular - unit)}
                  </span>
                </>
              )}
            </div>
          );
        })()}

        <div className="mt-6 space-y-3 leading-relaxed text-slate-600">
          <p>{longDesc}</p>
          {!product.description && (
            <p className="rounded-2xl bg-accent/5 p-4 text-sm text-slate-500">
              Photos &amp; details are indicative. Confirm the exact model,
              specifications and current best price with our team on WhatsApp
              before ordering.
            </p>
          )}
        </div>

        {/* service icons */}
        <div className="mt-7 grid grid-cols-3 gap-3">
          {serviceItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-2xl bg-light/60 px-2 py-4 text-center"
            >
              <Icon className="text-xl text-accent" />
              <span className="text-[0.68rem] font-semibold leading-tight text-slate-600">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Buy panel (controlled by the variant chosen above) */}
        <div className="mt-8">
          <ProductBuyPanel product={product} activeVariant={activeVariant} />
        </div>
      </div>
    </div>
  );
}
