import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaCheckCircle,
  FaChevronRight,
  FaClipboardList,
  FaEnvelope,
  FaHome,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStore,
  FaTruck,
  FaWhatsapp,
} from "react-icons/fa";
import { getOrderByRef } from "@/lib/orders/store";
import { BANK_DETAILS } from "@/lib/checkout/config";
import { getRuntimeSite } from "@/lib/content/runtime-site";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

export default async function OrderConfirmationPage({
  params,
}: {
  params: { ref: string };
}) {
  const order = getOrderByRef(params.ref);
  if (!order) notFound();
  const site = getRuntimeSite();

  const whatsappRecap = encodeURIComponent(
    `Hello Respak Express! I just placed an order on your website:\n\n` +
      `🧾 Order: ${order.ref}\n` +
      order.items
        .map((i) => `• ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} × ${i.qty}`)
        .join("\n") +
      `\n\n💰 Total: ${formatPrice(order.total)} (${order.paymentLabel})\n` +
      `📍 ${order.customer.city}\n\nPlease confirm my order. Thank you!`
  );

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
            <span className="text-primary">Order Confirmation</span>
          </nav>
        </div>
      </div>

      <section className="section-pad bg-white">
        <div className="container-px">
          <div className="mx-auto max-w-3xl">
            {/* Success banner */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-8 text-center sm:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-4xl text-white shadow-lg shadow-emerald-600/30">
                <FaCheckCircle />
              </div>
              <h1 className="mt-6 font-display text-3xl font-extrabold text-slate-900">
                Thank you — your order is in!
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Order reference{" "}
                <span className="rounded-lg bg-white px-2 py-0.5 font-mono text-sm font-extrabold text-primary">
                  {order.ref}
                </span>{" "}
                placed on {fmtDate(order.createdAt)}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
                {order.paymentMethod === "bank" ? (
                  <>
                    Please transfer{" "}
                    <b className="text-slate-700">
                      {formatPrice(order.total)}
                    </b>{" "}
                    to the account below and share the receipt on WhatsApp so we
                    can confirm your order quickly.
                  </>
                ) : (
                  <>
                    Our team will call you shortly to confirm your{" "}
                    <b className="text-slate-700">
                      {formatPrice(order.total)}
                    </b>{" "}
                    {order.paymentMethod === "cod"
                      ? "cash-on-delivery"
                      : "bank-transfer"}{" "}
                    order and arrange delivery to {order.customer.city}.
                  </>
                )}
              </p>
              {order.customer.email && (
                <p className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-emerald-700 shadow-sm">
                  <FaEnvelope className="shrink-0" /> Confirmation with your
                  full order details has been emailed to{" "}
                  <b className="break-all">{order.customer.email}</b>
                </p>
              )}
            </div>

            {/* Next-step / bank details */}
            {order.paymentMethod === "bank" && (
              <div className="mt-6 rounded-3xl border border-primary/15 bg-primary/5 p-6 sm:p-7">
                <h2 className="font-display text-lg font-bold text-primary">
                  Bank Transfer Details
                </h2>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Bank
                    </dt>
                    <dd className="mt-1 font-bold text-slate-800">
                      {BANK_DETAILS.bankName}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Account Title
                    </dt>
                    <dd className="mt-1 font-bold text-slate-800">
                      {BANK_DETAILS.accountTitle}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Account No.
                    </dt>
                    <dd className="mt-1 font-mono text-xs font-bold break-all text-slate-800">
                      {BANK_DETAILS.accountNumber}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  {BANK_DETAILS.instructions}
                </p>
              </div>
            )}

            {/* Items */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                <FaClipboardList className="text-[#E11D2A]" /> Order Summary
              </h2>
              <ul className="mt-5 divide-y divide-slate-100">
                {order.items.map((i, idx) => (
                  <li key={idx} className="flex items-center gap-4 py-3.5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      {i.image && (
                        <Image
                          src={i.image}
                          alt={i.name}
                          fill
                          sizes="64px"
                          className="object-contain p-1.5"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold text-slate-800">
                        {i.name}
                      </p>
                      {i.variantLabel && (
                        <p className="text-xs font-semibold text-slate-500">
                          Option: {i.variantLabel}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {i.qty} × {formatPrice(i.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {formatPrice(i.unitPrice * i.qty)}
                    </p>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-bold text-slate-900">
                    {formatPrice(order.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Delivery ({order.shippingLabel})</dt>
                  <dd className="font-bold text-slate-900">
                    {order.shippingFee === 0
                      ? "FREE"
                      : formatPrice(order.shippingFee)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <dt className="text-base font-bold text-slate-900">Total</dt>
                  <dd className="font-display text-xl font-extrabold text-slate-900">
                    {formatPrice(order.total)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Delivery to */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                <FaTruck className="text-[#E11D2A]" /> Delivering To
              </h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="font-bold text-slate-800">{order.customer.name}</p>
                <p className="flex items-start gap-2">
                  <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[#E11D2A]" />
                  {order.customer.address}, {order.customer.city}
                </p>
                <p className="flex items-center gap-2">
                  <FaPhoneAlt className="text-[#E11D2A]" /> {order.customer.phone}
                </p>
                {order.customer.notes && (
                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs italic text-slate-500">
                    Note: {order.customer.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={`https://wa.me/${site.whatsapp}?text=${whatsappRecap}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-sm font-bold text-white transition hover:brightness-95"
              >
                <FaWhatsapp /> Send Order Details on WhatsApp
              </a>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 px-6 py-4 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
              >
                <FaPhoneAlt /> Call {site.phone}
              </a>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                href="/products"
                className="font-bold text-[#E11D2A] hover:underline"
              >
                Continue Shopping →
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-primary"
              >
                <FaStore /> Visit our shop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
