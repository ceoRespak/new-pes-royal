/* ============================================================
   Checkout business rules (single source of truth).
   This file is plain data (no Node-only imports) so it can be
   imported by BOTH the client (checkout page, cart) and the
   server (order validation in /api/orders).
   ============================================================ */

import type { PaymentMethodId, ShippingMethodId } from "@/types";

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  desc: string;
  /** PKR added to the order total. */
  fee: number;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "peshawar",
    label: "Free — Same-day (Peshawar)",
    desc: "Free delivery within Peshawar city on orders placed before 4 PM.",
    fee: 0,
  },
  {
    id: "nationwide",
    label: "Nationwide Courier",
    desc: "Shipped safely all over Pakistan via courier. Fees may vary by city.",
    fee: 350,
  },
];

export const shippingMethod = (id: ShippingMethodId): ShippingMethod =>
  SHIPPING_METHODS.find((s) => s.id === id) ?? SHIPPING_METHODS[0];

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  desc: string;
  /** `manual` → works today. `gateway` → needs merchant credentials (below). */
  kind: "manual" | "gateway";
  enabled: boolean;
  /** Shown in the checkout as a note, e.g. "Pay cash to the rider". */
  hint?: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    desc: "Pay cash when your order arrives at your door.",
    kind: "manual",
    enabled: true,
    hint: "Available nationwide — courier COD fee may apply.",
  },
  {
    id: "bank",
    label: "Bank Transfer",
    desc: "Transfer to our account, then share the receipt on WhatsApp.",
    kind: "manual",
    enabled: true,
    hint: "Order is confirmed once payment reflects.",
  },
  // ------------------------------------------------------------------
  // ONLINE GATEWAYS — PLACEHOLDERS.
  // These are `enabled: false` until you have merchant accounts.
  // To activate one later:
  //   1. set enabled: true here,
  //   2. add its credentials to .env.local (e.g. JAZZCASH_MERCHANT_ID /
  //      JAZZCASH_SECRET / EASYPAISA_* / STRIPE_SECRET_KEY),
  //   3. implement `createGatewaySession()` + webhook verification in
  //      src/lib/checkout/gateways.ts and the /api/payments routes.
  // ------------------------------------------------------------------
  {
    id: "jazzcash",
    label: "JazzCash",
    desc: "Pay online with your JazzCash wallet or a card.",
    kind: "gateway",
    enabled: false,
    hint: "Requires a JazzCash PAYPRO merchant account.",
  },
  {
    id: "easypaisa",
    label: "Easypaisa",
    desc: "Pay online with your Easypaisa wallet.",
    kind: "gateway",
    enabled: false,
    hint: "Requires an Easypaisa merchant account.",
  },
  {
    id: "card",
    label: "Debit / Credit Card",
    desc: "Secure card payment (Visa / Mastercard).",
    kind: "gateway",
    enabled: false,
    hint: "Requires a card gateway (Stripe / 2Checkout).",
  },
];

export const enabledPaymentMethods = (): PaymentMethod[] =>
  PAYMENT_METHODS.filter((p) => p.enabled);

export const paymentMethod = (id: PaymentMethodId): PaymentMethod | undefined =>
  PAYMENT_METHODS.find((p) => p.id === id);

/* ------------------------------------------------------------------
   Bank transfer details — EDIT these with the real business account.
   ------------------------------------------------------------------ */
export const BANK_DETAILS = {
  bankName: "Bank Name Here", // e.g. "Meezan Bank"
  accountTitle: "RESPAK EXPRESS",
  accountNumber: "0000-0000000000", // your account / IBAN
  // Optional instructions shown at checkout / on the confirmation page.
  instructions:
    "After transferring, please send the receipt on WhatsApp so we can confirm your order quickly.",
};

/* ------------------------------------------------------------------
   Order numbers: human friendly prefix + counter (resets never).
   ------------------------------------------------------------------ */
export const ORDER_REF_PREFIX = "RE";

export const MIN_ORDER_QTY = 1;
export const MAX_ORDER_QTY = 99;
