"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FaChevronDown,
  FaClipboardList,
  FaInbox,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSyncAlt,
  FaUser,
} from "react-icons/fa";
import type { Order, OrderStatus, PaymentStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Counts {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

const emptyCounts: Counts = {
  pending: 0,
  confirmed: 0,
  processing: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
};

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const paymentStyle: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  refunded: "bg-rose-100 text-rose-700",
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<Counts>(emptyCounts);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyRef, setBusyRef] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load orders");
        return;
      }
      setOrders(data.orders ?? []);
      setCounts(data.counts ?? emptyCounts);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (
    ref: string,
    patch: { status?: OrderStatus; paymentStatus?: PaymentStatus }
  ) => {
    setBusyRef(ref);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, ...patch }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Update failed");
      } else {
        await load();
      }
    } catch {
      setError("Update failed — try again.");
    } finally {
      setBusyRef(null);
    }
  };

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalCount = orders.length;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E11D2A] to-orange-500 text-white">
              <FaClipboardList />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Customer Orders
              </h2>
              <p className="text-xs text-slate-400">
                {totalCount} total · placed from the online checkout
              </p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <FaSyncAlt className={cn(loading && "animate-spin")} /> Refresh
          </button>
        </div>

        {/* status filter */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
              filter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            All ({totalCount})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition",
                filter === s
                  ? statusStyle[s]
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {s} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
          Loading orders…
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <FaInbox className="mx-auto text-3xl text-slate-300" />
          <p className="mt-3 font-semibold text-slate-500">
            No {filter !== "all" ? filter : ""} orders yet.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Orders placed through the website checkout will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((o) => {
            const open = expanded === o.ref;
            const itemQty = o.items.reduce((n, i) => n + i.qty, 0);
            return (
              <div
                key={o.ref}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => setExpanded(open ? null : o.ref)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 text-left transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-primary">
                        {o.ref}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide",
                          statusStyle[o.status]
                        )}
                      >
                        {o.status}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide",
                          paymentStyle[o.paymentStatus]
                        )}
                      >
                        {o.paymentLabel} · {o.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {fmtDate(o.createdAt)} · {o.items.length} item(s) · {itemQty} qty
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base font-extrabold text-slate-900">
                      {formatPrice(o.total)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {o.customer.name} · {o.customer.city}
                    </p>
                  </div>
                  <FaChevronDown
                    className={cn(
                      "text-slate-400 transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>

                {open && (
                  <div className="border-t border-slate-100 px-5 py-5">
                    <div className="grid gap-6 lg:grid-cols-3">
                      {/* Items */}
                      <div className="lg:col-span-2">
                        <p className="text-[0.68rem] font-extrabold uppercase tracking-widest text-slate-400">
                          Items
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {o.items.map((i, idx) => (
                            <li
                              key={idx}
                              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2.5 text-sm"
                            >
                              <span className="min-w-0">
                                <span className="line-clamp-1 font-semibold text-slate-800">
                                  {i.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {i.variantLabel ? `${i.variantLabel} · ` : ""}
                                  {i.qty} × {formatPrice(i.unitPrice)}
                                </span>
                              </span>
                              <span className="shrink-0 font-bold text-slate-900">
                                {formatPrice(i.unitPrice * i.qty)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
                          <div className="flex justify-between text-slate-500">
                            <dt>Subtotal</dt>
                            <dd className="font-semibold text-slate-700">
                              {formatPrice(o.subtotal)}
                            </dd>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <dt>Delivery ({o.shippingLabel})</dt>
                            <dd className="font-semibold text-slate-700">
                              {o.shippingFee === 0
                                ? "FREE"
                                : formatPrice(o.shippingFee)}
                            </dd>
                          </div>
                          <div className="flex justify-between text-slate-900">
                            <dt className="font-bold">Total</dt>
                            <dd className="font-extrabold">
                              {formatPrice(o.total)}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {/* Customer + actions */}
                      <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4 text-sm">
                          <p className="flex items-center gap-2 font-bold text-slate-800">
                            <FaUser className="text-primary" /> {o.customer.name}
                          </p>
                          <p className="mt-2 flex items-start gap-2 text-xs text-slate-500">
                            <FaMapMarkerAlt className="mt-0.5 shrink-0 text-primary" />
                            {o.customer.address}, {o.customer.city}
                          </p>
                          <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                            <FaPhoneAlt className="text-primary" />
                            <a
                              href={`tel:${o.customer.phone}`}
                              className="hover:text-primary"
                            >
                              {o.customer.phone}
                            </a>
                          </p>
                          {o.customer.email && (
                            <p className="mt-1.5 text-xs text-slate-500">
                              ✉️ {o.customer.email}
                            </p>
                          )}
                          {o.customer.notes && (
                            <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs italic text-slate-500">
                              “{o.customer.notes}”
                            </p>
                          )}
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                          <label className="text-[0.68rem] font-extrabold uppercase tracking-widest text-slate-400">
                            Order status
                          </label>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {STATUSES.map((s) => (
                              <button
                                key={s}
                                disabled={busyRef === o.ref}
                                onClick={() =>
                                  update(o.ref, { status: s === o.status ? undefined : s })
                                }
                                className={cn(
                                  "rounded-full px-2.5 py-1 text-[0.65rem] font-bold capitalize transition disabled:opacity-50",
                                  o.status === s
                                    ? statusStyle[s] + " ring-2 ring-current"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                          <label className="text-[0.68rem] font-extrabold uppercase tracking-widest text-slate-400">
                            Payment
                          </label>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(["pending", "paid", "refunded"] as PaymentStatus[]).map(
                              (p) => (
                                <button
                                  key={p}
                                  disabled={busyRef === o.ref}
                                  onClick={() =>
                                    update(o.ref, { paymentStatus: p === o.paymentStatus ? undefined : p })
                                  }
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-[0.65rem] font-bold capitalize transition disabled:opacity-50",
                                    o.paymentStatus === p
                                      ? paymentStyle[p] + " ring-2 ring-current"
                                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                  )}
                                >
                                  {p}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
