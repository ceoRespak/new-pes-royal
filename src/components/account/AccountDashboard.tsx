"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaBoxOpen,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSave,
  FaSignOutAlt,
  FaSpinner,
  FaUserCircle,
} from "react-icons/fa";
import type { Order } from "@/types";
import { useSite } from "@/components/site/SiteProvider";
import { formatPrice } from "@/lib/utils";

export interface AccountCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  address?: string;
}

const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500";
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10";

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-600",
};

export default function AccountDashboard({
  customer,
  orders,
}: {
  customer: AccountCustomer;
  orders: Order[];
}) {
  const router = useRouter();
  const site = useSite();
  const [form, setForm] = useState({
    name: customer.name,
    phone: customer.phone,
    city: customer.city ?? "",
    address: customer.address ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setMsg({ type: "err", text: data.error || "Update failed" });
      } else {
        setMsg({ type: "ok", text: "Profile saved. It will auto-fill at checkout." });
      }
    } catch {
      setMsg({ type: "err", text: "Network error — try again." });
    }
    setBusy(false);
  };

  const logout = async () => {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const initials = customer.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid items-start gap-8 lg:grid-cols-3">
      {/* Profile card */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient font-display text-lg font-extrabold text-white">
            {initials || <FaUserCircle />}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-slate-900">
              {customer.name}
            </p>
            <p className="truncate text-xs text-slate-400">{customer.email}</p>
          </div>
        </div>

        <form onSubmit={save} className="mt-6 space-y-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input className={inputCls} value={form.name} onChange={set("name")} autoComplete="name" />
          </div>
          <div>
            <label className={labelCls}>
              <FaPhoneAlt className="mr-1 inline" /> Phone / WhatsApp
            </label>
            <input className={inputCls} value={form.phone} onChange={set("phone")} autoComplete="tel" />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input className={inputCls} value={form.city} onChange={set("city")} autoComplete="address-level2" />
          </div>
          <div>
            <label className={labelCls}>
              <FaMapMarkerAlt className="mr-1 inline" /> Delivery Address
            </label>
            <input className={inputCls} value={form.address} onChange={set("address")} autoComplete="street-address" />
          </div>

          {msg && (
            <p
              className={
                msg.type === "ok"
                  ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700"
                  : "rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600"
              }
            >
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-800 disabled:opacity-60"
          >
            {busy ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Profile
          </button>
        </form>

        <button
          onClick={logout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </div>

      {/* Order history */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card lg:col-span-2">
        <h2 className="font-display text-xl font-bold text-slate-900">Order History</h2>
        {orders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-light/40 px-6 py-12 text-center">
            <FaBoxOpen className="mx-auto text-3xl text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No orders yet under this account.
            </p>
            <Link href="/products" className="btn-primary mt-5">
              Browse Products
            </Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {orders.map((o) => (
              <li key={o.ref}>
                <Link
                  href={`/order/${o.ref}`}
                  className="block rounded-2xl border border-slate-100 p-4 transition hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-extrabold text-primary">
                        {o.ref}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Intl.DateTimeFormat("en-GB", {
                          dateStyle: "medium",
                        }).format(new Date(o.createdAt))}{" "}
                        · {o.items.length} item{o.items.length === 1 ? "" : "s"} ·{" "}
                        {o.paymentLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-extrabold text-slate-900">
                        {formatPrice(o.total)}
                      </span>
                      <span
                        className={
                          "rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide " +
                          (statusColor[o.status] ?? "bg-slate-100 text-slate-500")
                        }
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs text-slate-400">
          Questions about an order? Message us on WhatsApp{" "}
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-emerald-600 hover:underline"
          >
            {site.phone}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
