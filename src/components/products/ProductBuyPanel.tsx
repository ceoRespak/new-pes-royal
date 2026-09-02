"use client";

import { useState } from "react";
import {
  FaMinus,
  FaPhoneAlt,
  FaPlus,
  FaWhatsapp,
  FaEnvelope,
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
 * Quantity selector + order buttons. Price/order message reflect the
 * active variant that is chosen on the product page.
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
    `Hello PES! I would like to order:\n\n📦 ${product.name}${
      choice ? `\nOption: ${choice}` : ""
    }\nQuantity: ${qty}\nEstimated total: ${formatPrice(
      total
    )}\n\nPlease confirm availability & delivery.`
  );

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
      <div className="flex items-baseline gap-3">
        <p className="font-display text-3xl font-extrabold text-primary">
          {formatPrice(total)}
        </p>
        {regularUnit > unit && (
          <p className="text-sm text-slate-400 line-through">
            {formatPrice(regularUnit * qty)}
          </p>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {activeVariant ? `${activeVariant.label} · ` : ""}
        Inclusive of all taxes · {site.deliveryInfo || "Same-day delivery in Peshawar"}
      </p>

      {/* Quantity */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Quantity
        </p>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-light/50">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center text-primary transition hover:text-accent"
          >
            <FaMinus className="text-xs" />
          </button>
          <span className="w-12 text-center font-display text-lg font-bold text-primary">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center text-primary transition hover:text-accent"
          >
            <FaPlus className="text-xs" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <a
          href={`https://wa.me/${site.whatsapp}?text=${waMessage}`}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow transition hover:brightness-105"
        >
          <FaWhatsapp className="text-lg" /> Order on WhatsApp
        </a>
        <a
          href={`tel:${site.phone.replace(/\s/g, "")}`}
          className="btn-primary w-full"
        >
          <FaPhoneAlt /> {site.phone}
        </a>
        <a
          href={`mailto:${site.salesEmail}?subject=${encodeURIComponent(
            `Enquiry: ${product.name}`
          )}`}
          className="btn-outline w-full"
        >
          <FaEnvelope /> Request a Quote
        </a>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        {product.inStock
          ? "Available now — ships within 24–48 hrs"
          : "Currently out of stock — call to pre-order"}
      </div>
    </div>
  );
}

