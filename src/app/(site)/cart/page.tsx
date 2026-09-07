"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaChevronRight,
  FaHome,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaTrashAlt,
} from "react-icons/fa";
import { useCart, cartLineKey } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, ready, subtotal, setQty, remove } = useCart();
  const router = useRouter();

  return (
    <>
      {/* Header */}
      <div className="border-b border-slate-100 bg-light/70 pb-4 pt-28 lg:pt-32">
        <div className="container-px">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
          >
            <Link href="/" className="flex items-center gap-1.5 hover:text-primary">
              <FaHome /> Home
            </Link>
            <FaChevronRight className="text-[0.6rem]" />
            <span className="text-primary">Shopping Cart</span>
          </nav>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review your items before heading to checkout.
          </p>
        </div>
      </div>

      <section className="section-pad bg-white">
        <div className="container-px">
          {ready && items.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-light/40 px-8 py-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 text-4xl text-primary">
                <FaShoppingCart />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold text-slate-900">
                Your cart is empty
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Browse our catalog and add genuine electrical products to get
                started.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF5A00] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#FF5A00]/25 transition hover:-translate-y-0.5 hover:bg-[#E04D00]"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-3">
              {/* Lines */}
              <div className="space-y-4 lg:col-span-2">
                {items.map((item) => {
                  const key = cartLineKey(item);
                  return (
                    <div
                      key={key}
                      className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-5 sm:p-5"
                    >
                      <Link
                        href={`/products/${item.slug}`}
                        className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-primary/5 sm:h-28 sm:w-28"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="112px"
                            className="object-contain p-2"
                          />
                        ) : null}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="line-clamp-2 text-sm font-bold text-slate-800 transition hover:text-[#FF5A00]"
                            >
                              {item.name}
                            </Link>
                            {item.variantLabel && (
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                Option:{" "}
                                <span className="text-slate-700">
                                  {item.variantLabel}
                                </span>
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(key)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <FaTrashAlt className="text-sm" />
                          </button>
                        </div>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                            <button
                              type="button"
                              onClick={() => setQty(key, item.qty - 1)}
                              aria-label="Decrease quantity"
                              className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:text-[#FF5A00]"
                            >
                              <FaMinus className="text-[0.6rem]" />
                            </button>
                            <span className="w-9 text-center text-sm font-bold text-slate-900">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(key, item.qty + 1)}
                              aria-label="Increase quantity"
                              className="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:text-[#FF5A00]"
                            >
                              <FaPlus className="text-[0.6rem]" />
                            </button>
                          </div>
                          <div className="text-right">
                            {item.regularPrice &&
                              item.regularPrice > item.unitPrice && (
                                <p className="text-xs text-slate-400 line-through">
                                  {formatPrice(item.regularPrice)}
                                </p>
                              )}
                            <p className="text-base font-extrabold text-slate-900">
                              {formatPrice(item.unitPrice * item.qty)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  ← Continue shopping
                </Link>
              </div>

              {/* Summary */}
              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.25)] lg:sticky lg:top-28">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Order Summary
                </h2>
                <dl className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Subtotal ({items.length} item{items.length > 1 ? "s" : ""})</dt>
                    <dd className="font-bold text-slate-900">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Delivery</dt>
                    <dd className="font-semibold text-emerald-600">
                      Calculated at checkout
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Estimated total</span>
                  <span className="font-display text-xl font-extrabold text-slate-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-6 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#FF5A00]/25 transition hover:-translate-y-0.5 hover:bg-[#E04D00]"
                >
                  Proceed to Checkout
                </button>
                <p className="mt-3 text-center text-xs leading-relaxed text-slate-400">
                  Cash on Delivery, Bank Transfer &amp; online payment options
                  are available at checkout.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
