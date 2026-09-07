"use client";

import { useState } from "react";
import {
  FaCheck,
  FaMinus,
  FaPhoneAlt,
  FaPlus,
  FaShoppingCart,
  FaWhatsapp,
} from "react-icons/fa";
import type { Product, ProductVariant } from "@/types";
import { useCart } from "@/components/cart/CartProvider";
import { useSite } from "@/components/site/SiteProvider";
import { resolveImage } from "@/lib/images";
import { formatPrice } from "@/lib/utils";

const toAbs = resolveImage;

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
  const site = useSite();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  const variantUnit = activeVariant
    ? toNum(activeVariant.salePrice ?? activeVariant.price)
    : null;
  const unit = variantUnit ?? product.salePrice ?? product.price;
  const regularUnit = activeVariant
    ? toNum(activeVariant.price) ?? unit
    : product.price;
  const total = unit * qty;

  const handleAddToCart = () => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: activeVariant?.image ? toAbs(activeVariant.image) : product.images[0],
      variantLabel: activeVariant ? activeVariant.label : undefined,
      unitPrice: unit,
      regularPrice: regularUnit,
      qty,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

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
          <span className="rounded-full bg-[#FF5A00]/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-[#FF5A00]">
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
            className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:text-[#FF5A00]"
          >
            <FaMinus className="text-xs" />
          </button>
          <span className="w-12 text-center font-display text-lg font-bold text-slate-900">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:text-[#FF5A00]"
          >
            <FaPlus className="text-xs" />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          onClick={handleAddToCart}
          className={
            added
              ? "flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
              : "flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A00] px-6 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#FF5A00]/25 transition hover:-translate-y-0.5 hover:bg-[#E04D00]"
          }
        >
          {added ? (
            <>
              <FaCheck className="text-lg" /> Added to Cart
            </>
          ) : (
            <>
              <FaShoppingCart className="text-lg" /> Add to Cart
            </>
          )}
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={`https://wa.me/${site.whatsapp}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            <FaWhatsapp className="text-base" /> WhatsApp Order
          </a>
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#FF5A00] hover:text-[#FF5A00]"
          >
            <FaPhoneAlt /> Call Us
          </a>
        </div>
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

