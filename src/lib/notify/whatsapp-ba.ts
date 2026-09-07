/**
 * WhatsApp Business (Cloud API) sender — order confirmation messages.
 *
 * INACTIVE until these env vars are set (see .env.example + docs):
 *   WA_BUSINESS_TOKEN     Meta Graph access token (WhatsApp Business account)
 *   WA_PHONE_ID           the business phone-number ID
 *   WA_API_VERSION        default v21.0
 *   WA_ORDER_TEMPLATE     approved template name (e.g. order_placed)
 *   WA_ORDER_TEMPLATE_LANG  template language code (default en)
 *
 * Without credentials every call is a safe no-op that logs why, so the rest of
 * checkout is never affected.
 */

import "server-only";

import type { Order } from "@/types";

const GRAPH_BASE = "https://graph.facebook.com";

function env(v: string): string | undefined {
  const s = process.env[v];
  return s && s.trim() !== "" ? s.trim() : undefined;
}

export function waConfigured(): boolean {
  return Boolean(env("WA_BUSINESS_TOKEN") && env("WA_PHONE_ID"));
}

/** Normalise a Pakistani phone to E.164 for the API (0300… -> 92300…). */
export function normalizePhone(raw?: string): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  if (digits.startsWith("92")) return digits;
  return `92${digits}`;
}

async function graphCall<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; status?: number; data?: T; error?: string }> {
  const token = env("WA_BUSINESS_TOKEN");
  const phoneId = env("WA_PHONE_ID");
  const version = env("WA_API_VERSION") || "v21.0";
  if (!token || !phoneId) {
    return { ok: false, error: "WA_BUSINESS_TOKEN / WA_PHONE_ID not set." };
  }
  const url = `${GRAPH_BASE}/${version}/${phoneId}/${path}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as T;
    if (!res.ok) {
      return { ok: false, status: res.status, error: JSON.stringify(json) };
    }
    return { ok: true, status: res.status, data: json };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Send a free-form text message (used for follow-ups / confirmations). */
export async function sendWaText(
  phone: string,
  text: string
): Promise<{ ok: boolean; error?: string }> {
  return graphCall("messages", {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "text",
    text: { body: text },
  });
}

/**
 * Send the approved "order placed" template to a customer.
 *
 * The template's body is expected to have (up to) three variables, matched in
 * order: {{1}} customer first name, {{2}} order ref (e.g. RE-00012),
 * {{3}} total (e.g. Rs 3,730). Buttons ("Confirm Order" / "Cancel Order") are
 * part of the approved template in Meta, NOT sent from here.
 */
export async function sendOrderTemplate(
  phone: string,
  order: { ref: string; total: number; customer: { name: string } }
): Promise<{ ok: boolean; error?: string }> {
  const templateName = env("WA_ORDER_TEMPLATE");
  const lang = env("WA_ORDER_TEMPLATE_LANG") || "en";
  if (!templateName) {
    return { ok: false, error: "WA_ORDER_TEMPLATE not set." };
  }
  const firstName = String(order.customer.name ?? "").trim().split(/\s+/)[0] || "there";
  const amount = `Rs ${order.total.toLocaleString("en-PK")}`;

  return graphCall("messages", {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "template",
    template: {
      name: templateName,
      language: { code: lang },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: firstName },
            { type: "text", text: order.ref },
            { type: "text", text: amount },
          ],
        },
      ],
    },
  });
}

/**
 * Send the WhatsApp order-confirmation template for a freshly placed order.
 * Returns skipped:true (no-op) whenever credentials/template aren't configured,
 * so the caller can stay silent — never blocks or throws.
 */
export async function sendOrderWhatsAppConfirmation(order: Order): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
}> {
  if (!waConfigured()) return { ok: false, skipped: true, error: "Not configured." };
  if (!env("WA_ORDER_TEMPLATE"))
    return { ok: false, skipped: true, error: "No template set." };
  const phone = normalizePhone(order.customer.phone);
  if (!phone) return { ok: false, skipped: true, error: "No valid phone." };
  return sendOrderTemplate(phone, order);
}
