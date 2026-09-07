import { NextResponse } from "next/server";
import type { OrderItem, PaymentMethodId, ShippingMethodId } from "@/types";
import {
  MAX_ORDER_QTY,
  MIN_ORDER_QTY,
  paymentMethod,
  shippingMethod,
} from "@/lib/checkout/config";
import { createOrder } from "@/lib/orders/store";
import { sendOrderEmails } from "@/lib/notify/mailer";
import { sendOrderWhatsAppConfirmation } from "@/lib/notify/whatsapp-ba";
import { getLiveProducts } from "@/lib/store/live";
import { getCurrentCustomer } from "@/lib/customers/session";
import { variantsForProduct } from "@/lib/admin/variants-store";
import { products as snapshotProducts } from "@/data/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingItem {
  productId?: unknown;
  variantLabel?: unknown;
  qty?: unknown;
}

interface IncomingCustomer {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  city?: unknown;
  address?: unknown;
  notes?: unknown;
}

const clean = (v: unknown) => String(v ?? "").trim();

const toQty = (v: unknown): number | null => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return null;
  return Math.min(MAX_ORDER_QTY, Math.max(MIN_ORDER_QTY, n));
};

const toPriceNum = (v: string | number | undefined): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

/** Grab the current catalog, live API first, frozen snapshot as offline fallback. */
async function loadCatalogIndex() {
  try {
    const live = await getLiveProducts();
    if (live.length) {
      return new Map(live.map((p) => [String(p.id), p]));
    }
  } catch {
    /* live unreachable → fall through to snapshot */
  }
  return new Map(snapshotProducts.map((p) => [String(p.id), p]));
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const customerRaw = (body.customer ?? {}) as IncomingCustomer;
  const customer = {
    name: clean(customerRaw.name),
    phone: clean(customerRaw.phone),
    email: clean(customerRaw.email).toLowerCase(),
    city: clean(customerRaw.city),
    address: clean(customerRaw.address),
    notes: clean(customerRaw.notes).slice(0, 1000),
  };
  if (!customer.name) {
    return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  }
  if (!customer.phone || customer.phone.replace(/[^\d]/g, "").length < 7) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid phone number." },
      { status: 400 }
    );
  }
  if (!customer.city) {
    return NextResponse.json({ ok: false, error: "Please enter your city." }, { status: 400 });
  }
  if (!customer.address) {
    return NextResponse.json({ ok: false, error: "Please enter your delivery address." }, { status: 400 });
  }

  const ship = shippingMethod(body.shippingMethod as ShippingMethodId);
  const pay = paymentMethod(body.paymentMethod as PaymentMethodId);
  if (!pay || !pay.enabled) {
    return NextResponse.json(
      { ok: false, error: "Please choose a valid payment method." },
      { status: 400 }
    );
  }

  const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ ok: false, error: "Your cart is empty." }, { status: 400 });
  }

  // Index of products to recompute names/prices server-side (no client prices trusted).
  const index = await loadCatalogIndex();

  const items: OrderItem[] = [];
  let subtotal = 0;

  for (const raw of rawItems) {
    const productId = String(raw.productId ?? "");
    const qty = toQty(raw.qty);
    const product = productId ? index.get(productId) : undefined;

    if (!product || qty === null) {
      return NextResponse.json(
        { ok: false, error: "One of the items in your cart is no longer available. Please refresh and try again." },
        { status: 400 }
      );
    }

    const variantLabel = clean(raw.variantLabel);
    let unitPrice: number | null = null;

    if (variantLabel) {
      const match = variantsForProduct(productId).find(
        (v) => String(v.label).trim() === variantLabel
      );
      if (!match) {
        return NextResponse.json(
          { ok: false, error: `Option "${variantLabel}" is no longer available for ${product.name}.` },
          { status: 400 }
        );
      }
      unitPrice = toPriceNum(match.salePrice ?? match.price);
    }
    unitPrice ??= toPriceNum(product.salePrice ?? product.price) ?? toPriceNum(product.price);
    if (unitPrice === null) {
      return NextResponse.json(
        { ok: false, error: `We couldn't confirm a price for ${product.name}. Please contact us on WhatsApp.` },
        { status: 400 }
      );
    }

    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    items.push({
      productId,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] ?? "",
      variantLabel: variantLabel || undefined,
      unitPrice,
      qty,
    });
  }

  const shippingFee = ship.fee;
  const total = subtotal + shippingFee;

  // If the buyer is signed in, remember the account so their order history
  // shows it. Errors reading the session never block guest checkout.
  let customerId: string | undefined;
  try {
    const cur = await getCurrentCustomer();
    customerId = cur?.id;
  } catch {
    /* guest checkout unaffected */
  }

  const order = createOrder({
    customer,
    shippingMethod: ship.id,
    shippingLabel: ship.label,
    items,
    subtotal,
    shippingFee,
    total,
    paymentMethod: pay.id,
    paymentLabel: pay.label,
    paymentStatus: "pending",
    ...(customerId ? { customerId } : {}),
  });

  // Fire the confirmation emails (customer + store). Failures are logged and
  // never affect the checkout response.
  try {
    const res = await sendOrderEmails(order);
    if (res.note) console.log("[order-email]", res.note);
  } catch (e) {
    console.warn("[order-email] send error:", String(e));
  }

  // WhatsApp order-confirmation template (Confirm/Cancel buttons come from the
  // approved Meta template). Silent skip until WA_* env vars are configured.
  try {
    const wa = await sendOrderWhatsAppConfirmation(order);
    if (wa.ok === false && !wa.skipped) {
      console.warn("[order-whatsapp]", wa.error || "send failed");
    }
  } catch (e) {
    console.warn("[order-whatsapp] send error:", String(e));
  }

  return NextResponse.json({ ok: true, order });
}
