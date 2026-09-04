"use client";

import { useState } from "react";
import {
  FaMinus,
  FaPhoneAlt,
  FaPlus,
  FaWhatsapp,
} from "react-icons/fa";
import type { Product, ProductVariant } from "@/types";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/utils";

interface ProductBuyPanelProps {
  product: Product;
  /** Selected variant — controlled by the parent so the main image follows. */
  activeVariant?: ProductVariant;
}

const toNum = (v: string | number | undefined): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

/**
 * Quantity selector + order buttons (storefront look). Price/order message
 * reflect the active variant chosen on the product page.
 */
export default function ProductBuyPanel({
  product,
  activeVariant,
}: ProductBuyPanelProps) {
  const [qty, setQty] = useState(1);

  const variantUnit = activeVariant
    ? toNum(activeVariant.salePrice ?? activeVariant.price)
    : null;
  const unit = variantUnit ?? product.salePrice ?? product.price;
  const regularUnit = activeVariant
    ? toNum(activeVariant.price) ?? unit
    : product.price;
  const total = unit * qty;

  const choice = activeVariant
    ? `${activeVariant.label} — ${formatPrice(unit)}`
    : null;
  const waMessage = encodeURIComponent(
    `Hello Respak Express! I would like to order:\n\n📦 ${product.name}${
      choice ? `\nOption: ${choice}` : ""
    }\nQuantity: ${qty}\nEstimated total: ${formatPrice(
      total
    )}\n\nPlease confirm availability & delivery.`
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.25)] sm:p-6">
      {/* price summary */}
      <div className="flex items-end justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-slate-400">
            {activeVariant ? `${activeVariant.label} · ` : ""}Estimated total
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
              {formatPrice(total)}
            </p>
            {regularUnit > unit && (
              <p className="text-sm font-medium text-slate-400 line-through">
                {formatPrice(regularUnit * qty)}
              </p>
            )}
          </div>
        </div>
        {activeVariant && (
          <span className="rounded-full bg-[#E11D2A]/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-[#E11D2A]">
            {qty} × {formatPrice(unit)}
          </span>
        )}
      </div>

      {/* Quantity */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Quantity
        </p>
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:text-[#E11D2A]"
          >
            <FaMinus className="text-xs" />
          </button>
          <span className="w-12 text-center font-display text-lg font-bold text-slate-900">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:text-[#E11D2A]"
          >
            <FaPlus className="text-xs" />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-5 space-y-2.5">
        <a
          href={`https://wa.me/${site.whatsapp}?text=${waMessage}`}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E11D2A] px-6 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#E11D2A]/25 transition hover:-translate-y-0.5 hover:bg-[#b8111f]"
        >
          <FaWhatsapp className="text-lg" /> Order on WhatsApp
        </a>
        <a
          href={`tel:${site.phone.replace(/\s/g, "")}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[#E11D2A] hover:text-[#E11D2A]"
        >
          <FaPhoneAlt /> {site.phone}
        </a>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-center text-xs font-semibold text-emerald-700">
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
        {product.inStock
          ? "In stock — ships within 24–48 hrs"
          : "Currently out of stock — call to pre-order"}
        <span className="mx-1 hidden h-3 w-px bg-emerald-200 sm:block" />
        <span className="hidden sm:inline">
          {site.deliveryInfo || "Same-day delivery in Peshawar"}
        </span>
      </div>
    </div>
  );
}

