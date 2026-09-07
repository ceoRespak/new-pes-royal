"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaChevronRight,
  FaCheckCircle,
  FaHome,
  FaLock,
  FaMoneyBillWave,
  FaShoppingCart,
  FaSpinner,
  FaTruck,
  FaUniversity,
} from "react-icons/fa";
import type { PaymentMethodId, ShippingMethodId } from "@/types";
import { useCart } from "@/components/cart/CartProvider";
import {
  BANK_DETAILS,
  enabledPaymentMethods,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
} from "@/lib/checkout/config";
import { useSite } from "@/components/site/SiteProvider";
import { formatPrice } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#E11D2A] focus:bg-white focus:ring-4 focus:ring-[#E11D2A]/10";

const labelCls =
  "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500";

export default function CheckoutPage() {
  const site = useSite();
  const { items, ready, subtotal, clear } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    notes: "",
  });
  const [shippingId, setShippingId] = useState<ShippingMethodId>("peshawar");
  const [payId, setPayId] = useState<PaymentMethodId>("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Signed-in customer (optional) → prefill their saved details.
  const [me, setMe] = useState<{
    name: string;
    email: string;
    phone: string;
    city?: string;
    address?: string;
  } | null>(null);
  const [saveAddr, setSaveAddr] = useState(true);

  useEffect(() => {
    let on = true;
    fetch("/api/account/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!on || !d?.ok || !d.customer) return;
        const c = d.customer as {
          name: string;
          email: string;
          phone: string;
          city?: string;
          address?: string;
        };
        setMe(c);
        setForm((f) => ({
          ...f,
          name: f.name || c.name || "",
          phone: f.phone || c.phone || "",
          email: f.email || c.email || "",
          city: f.city || c.city || "",
          address: f.address || c.address || "",
        }));
      })
      .catch(() => {});
    return () => {
      on = false;
    };
  }, []);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const ship = SHIPPING_METHODS.find((s) => s.id === shippingId)!;
  const pay = PAYMENT_METHODS.find((p) => p.id === payId)!;
  const availablePayments = enabledPaymentMethods();
  const shippingFee = ship.fee;
  const total = subtotal + shippingFee;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Please enter your full name.");
    if (form.phone.replace(/[^\d]/g, "").length < 7)
      return setError("Please enter a valid phone number.");
    if (!form.city.trim()) return setError("Please enter your city.");
    if (!form.address.trim())
      return setError("Please enter your delivery address.");

    setBusy(true);
    try {
      // Signed-in user: keep their saved profile up to date.
      if (me && saveAddr) {
        try {
          await fetch("/api/account/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              phone: form.phone,
              city: form.city,
              address: form.address,
            }),
          });
        } catch {
          /* saving profile is best-effort */
        }
      }
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          shippingMethod: shippingId,
          paymentMethod: payId,
          items: items.map((i) => ({
            productId: i.productId,
            variantLabel: i.variantLabel ?? "",
            qty: i.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "We couldn't place your order. Please try again.");
        setBusy(false);
        return;
      }
      clear();
      router.push(`/order/${data.order.ref}`);
    } catch {
      setError("Network error — please check your connection and try again.");
      setBusy(false);
    }
  };

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
            <Link href="/cart" className="hover:text-primary">
              Cart
            </Link>
            <FaChevronRight className="text-[0.6rem]" />
            <span className="text-primary">Checkout</span>
          </nav>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-900">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} item{items.length === 1 ? "" : "s"} · fill in your
            delivery &amp; payment details.
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
                Nothing to check out
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Your cart is empty. Add a few products first.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E11D2A] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#E11D2A]/25 transition hover:-translate-y-0.5 hover:bg-[#b8111f]"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="grid items-start gap-8 lg:grid-cols-5"
            >
              {/* -------- Details -------- */}
              <div className="space-y-6 lg:col-span-3">
                {/* Contact & delivery */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                    <FaTruck className="text-[#E11D2A]" /> Delivery Details
                  </h2>
                  {me && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary/5 px-4 py-3 text-sm text-slate-700">
                      <span>
                        Signed in as <b>{me.name}</b> — we filled in your saved
                        details.
                      </span>
                      <Link
                        href="/account"
                        className="shrink-0 font-bold text-primary hover:underline"
                      >
                        Manage account
                      </Link>
                    </div>
                  )}
                  {me && (
                    <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={saveAddr}
                        onChange={(e) => setSaveAddr(e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                      Save this name / phone / address to my account for next
                      time
                    </label>
                  )}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="co-name" className={labelCls}>
                        Full Name *
                      </label>
                      <input
                        id="co-name"
                        className={inputCls}
                        placeholder="e.g. Ahmed Khan"
                        value={form.name}
                        onChange={set("name")}
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="co-phone" className={labelCls}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        id="co-phone"
                        className={inputCls}
                        placeholder="03XX XXXXXXX"
                        value={form.phone}
                        onChange={set("phone")}
                        autoComplete="tel"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="co-email" className={labelCls}>
                        Email (optional)
                      </label>
                      <input
                        id="co-email"
                        type="email"
                        className={inputCls}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={set("email")}
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label htmlFor="co-city" className={labelCls}>
                        City *
                      </label>
                      <input
                        id="co-city"
                        className={inputCls}
                        placeholder="e.g. Peshawar"
                        value={form.city}
                        onChange={set("city")}
                        autoComplete="address-level2"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="co-address" className={labelCls}>
                        Complete Address *
                      </label>
                      <input
                        id="co-address"
                        className={inputCls}
                        placeholder="House/Shop no, street, area"
                        value={form.address}
                        onChange={set("address")}
                        autoComplete="street-address"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="co-notes" className={labelCls}>
                        Order Notes (optional)
                      </label>
                      <textarea
                        id="co-notes"
                        rows={3}
                        className={inputCls}
                        placeholder="Any special instructions for delivery…"
                        value={form.notes}
                        onChange={set("notes")}
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                    <FaTruck className="text-[#E11D2A]" /> Delivery Method
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {SHIPPING_METHODS.map((s) => {
                      const active = s.id === shippingId;
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setShippingId(s.id)}
                          className={`rounded-2xl border-2 p-4 text-left transition ${
                            active
                              ? "border-[#E11D2A] bg-[#E11D2A]/5"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-800">
                              {s.label}
                            </span>
                            <span
                              className={`text-sm font-extrabold ${
                                s.fee === 0
                                  ? "text-emerald-600"
                                  : "text-slate-800"
                              }`}
                            >
                              {s.fee === 0 ? "FREE" : formatPrice(s.fee)}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                            {s.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                    <FaMoneyBillWave className="text-[#E11D2A]" /> Payment Method
                  </h2>
                  <div className="mt-4 space-y-3">
                    {availablePayments.map((p) => {
                      const active = p.id === payId;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => setPayId(p.id)}
                          className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition ${
                            active
                              ? "border-[#E11D2A] bg-[#E11D2A]/5"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              active
                                ? "border-[#E11D2A] bg-[#E11D2A]"
                                : "border-slate-300"
                            }`}
                          >
                            {active && (
                              <FaCheckCircle className="text-[0.6rem] text-white" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                              {p.label}
                              {!p.enabled && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-amber-700">
                                  Coming soon
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                              {p.desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {payId === "bank" && (
                    <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                      <p className="flex items-center gap-2 text-sm font-bold text-primary">
                        <FaUniversity /> Bank Transfer Details
                      </p>
                      <dl className="mt-3 space-y-1.5 text-sm text-slate-700">
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Bank</dt>
                          <dd className="text-right font-semibold">
                            {BANK_DETAILS.bankName}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Account Title</dt>
                          <dd className="text-right font-semibold">
                            {BANK_DETAILS.accountTitle}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-slate-500">Account No.</dt>
                          <dd className="font-mono text-right text-xs font-bold">
                            {BANK_DETAILS.accountNumber}
                          </dd>
                        </div>
                      </dl>
                      <p className="mt-3 text-xs leading-relaxed text-slate-500">
                        {BANK_DETAILS.instructions}
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                    {error}
                  </p>
                )}
              </div>

              {/* -------- Summary -------- */}
              <aside className="space-y-6 lg:col-span-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.25)] lg:sticky lg:top-28">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Your Order
                  </h2>
                  <ul className="mt-4 space-y-3 border-b border-slate-100 pb-4">
                    {items.map((i) => (
                      <li key={`${i.productId}::${i.variantLabel ?? ""}`} className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                          {i.image && (
                            <Image
                              src={i.image}
                              alt={i.name}
                              fill
                              sizes="56px"
                              className="object-contain p-1"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-bold text-slate-800">
                            {i.name}
                          </p>
                          {i.variantLabel && (
                            <p className="text-[0.68rem] text-slate-500">
                              {i.variantLabel}
                            </p>
                          )}
                          <p className="text-[0.68rem] text-slate-400">
                            {i.qty} × {formatPrice(i.unitPrice)}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-slate-900">
                          {formatPrice(i.unitPrice * i.qty)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-4 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Subtotal</dt>
                      <dd className="font-bold text-slate-900">
                        {formatPrice(subtotal)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Delivery ({ship.label})</dt>
                      <dd
                        className={`font-bold ${
                          shippingFee === 0 ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3">
                      <dt className="text-base font-bold text-slate-900">Total</dt>
                      <dd className="font-display text-xl font-extrabold text-slate-900">
                        {formatPrice(total)}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="submit"
                    disabled={busy || !ready}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#E11D2A] px-6 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#E11D2A]/25 transition hover:-translate-y-0.5 hover:bg-[#b8111f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? (
                      <>
                        <FaSpinner className="animate-spin" /> Placing Order…
                      </>
                    ) : (
                      <>
                        <FaLock /> Place Order · {formatPrice(total)}
                      </>
                    )}
                  </button>
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Need help?{" "}
                    <a
                      href={`https://wa.me/${site.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-emerald-600 hover:underline"
                    >
                      Chat on WhatsApp
                    </a>
                  </p>
                </div>
              </aside>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
