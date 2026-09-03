"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaCheckCircle,
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
  { icon: FaTruck, label: "Same-day delivery in Peshawar" },
  { icon: FaShieldAlt, label: "100% genuine & warranty" },
  { icon: FaUndo, label: "7-day easy returns" },
];

/**
 * Single product view (storefront look). The FIRST variant is selected by
 * default; choosing the 2nd / 3rd variant swaps the main image & price.
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
  const features = (product.features ?? []).slice(0, 5);

  const unit = activeUnit ?? product.salePrice ?? product.price;
  const regular =
    activeVariant && toNum(activeVariant.price) != null
      ? (toNum(activeVariant.price) as number)
      : product.salePrice
        ? product.price
        : unit;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
      {/* ============ Gallery (sticky on desktop) ============ */}
      <div className="lg:sticky lg:top-28">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50">
          <Image
            key={mainImage}
            src={mainImage}
            alt={`${product.name}${activeVariant ? ` — ${activeVariant.label}` : ""}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-6 sm:p-10"
          />
          {/* top-left badges */}
          <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">
            {product.badge && (
              <span className="rounded-full bg-[#E11D2A] px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-wider text-white shadow">
                {product.badge}
              </span>
            )}
            {regular > unit && (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-wider text-white shadow">
                Save {formatPrice(regular - unit)}
              </span>
            )}
          </div>
          {/* active variant chip */}
          {variants.length > 0 && activeVariant && (
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
              <FaCheckCircle className="text-emerald-500" />
              {activeVariant.label}
              {activeUnit != null && (
                <span className="text-[#E11D2A]">{formatPrice(activeUnit)}</span>
              )}
            </span>
          )}
        </div>

        {/* Variant picker */}
        {thumbs.length > 0 && (
          <div className="mt-4" role="radiogroup" aria-label="Select option">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Select option — image &amp; price update
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {thumbs.map((t, i) => {
                const selected = i === safeIdx;
                return (
                  <button
                    key={i}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setIdx(i)}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-2xl border-2 bg-white p-2 text-left transition",
                      selected
                        ? "border-[#E11D2A] shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "relative block h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100",
                        selected ? "ring-2 ring-[#E11D2A]/30" : ""
                      )}
                    >
                      <Image
                        src={t.src}
                        alt={t.label}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block truncate text-xs font-bold",
                          selected ? "text-[#E11D2A]" : "text-slate-700"
                        )}
                      >
                        {t.label}
                      </span>
                      {t.price != null && (
                        <span className="block text-[0.7rem] font-semibold text-slate-500">
                          {formatPrice(t.price)}
                        </span>
                      )}
                    </span>
                    {selected && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E11D2A] text-[0.5rem] text-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============ Info / buy area ============ */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/products?category=${product.category}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#E11D2A]/8 px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#E11D2A] transition hover:bg-[#E11D2A] hover:text-white"
          >
            {catName}
          </Link>
          {product.inStock && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[0.68rem] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              In Stock
            </span>
          )}
        </div>

        <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          {product.name}
        </h1>

        {(product.tagline || category?.tagline) && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
            {product.tagline || category?.tagline}
          </p>
        )}

        {/* rating + id */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          {product.reviews > 0 ? (
            <span className="flex items-center gap-1.5">
              <RatingStars rating={product.rating} className="!text-amber-400" />
              <b className="font-semibold text-slate-600">{product.rating}</b>{" "}
              ({product.reviews} reviews)
            </span>
          ) : (
            <span className="font-semibold text-slate-400">New product</span>
          )}
          <span className="h-3 w-px bg-slate-200" />
          <span>SKU: {product.id}</span>
        </div>

        {/* Price */}
        <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1 border-b border-slate-100 pb-5">
          <p className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
            {formatPrice(unit)}
          </p>
          {regular > unit && (
            <p className="pb-1 text-lg font-medium text-slate-400 line-through">
              {formatPrice(regular)}
            </p>
          )}
        </div>

        {/* key points */}
        {features.length > 0 && (
          <ul className="mt-5 space-y-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5 text-sm text-slate-600"
              >
                <FaCheckCircle className="mt-0.5 shrink-0 text-[#E11D2A]" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 space-y-3 leading-relaxed text-slate-600">
          <p>{longDesc}</p>
          {!product.description && (
            <p className="rounded-2xl bg-[#E11D2A]/5 px-4 py-3 text-sm text-slate-500">
              Photos &amp; details are indicative. Confirm the exact model,
              specifications and current best price with our team on WhatsApp
              before ordering.
            </p>
          )}
        </div>

        {/* service mini row */}
        <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
          {serviceItems.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5"
            >
              <Icon className="shrink-0 text-[#E11D2A]" />
              <span className="text-[0.72rem] font-semibold leading-tight text-slate-600">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Buy panel (follows selected variant) */}
        <div className="mt-7">
          <ProductBuyPanel product={product} activeVariant={activeVariant} />
        </div>
      </div>
    </div>
  );
}

