/**
 * Order message builders — used to compose the order confirmation email
 * (customer + store owner) and the WhatsApp order recap.
 * Pure functions (no Node-only APIs) so they can be reused anywhere.
 */

import type { Order } from "@/types";
import { site } from "@/data/site";
import { BANK_DETAILS } from "@/lib/checkout/config";

const rs = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Payment / bank note shown inside confirmations when relevant. */
function paymentNote(order: Order): string {
  if (order.paymentMethod === "bank") {
    return `Please pay ${rs(
      order.total
    )} via bank transfer to ${BANK_DETAILS.bankName} — Account Title: ${
      BANK_DETAILS.accountTitle
    }, Account No: ${BANK_DETAILS.accountNumber}. Then send your receipt on WhatsApp so we can confirm quickly.`;
  }
  if (order.paymentMethod === "cod") {
    return `Pay ${rs(order.total)} in cash when your order is delivered.`;
  }
  return `Payment method: ${order.paymentLabel}.`;
}

export interface OrderMailCopy {
  subject: string;
  text: string;
  html: string;
}

/** Plain-text lines used for the WhatsApp recap (owner relay). */
export function orderWhatsappText(order: Order, relayToCustomer = false): string {
  const customer = relayToCustomer
    ? ` for ${order.customer.name}`
    : "";
  const lines = [
    `🧾 Respak Express — Order ${order.ref}${customer}`,
    `🕒 Placed: ${fmtDate(order.createdAt)}`,
    "",
    ...order.items.map(
      (i) =>
        `• ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} × ${
          i.qty
        } — ${rs(i.unitPrice * i.qty)}`
    ),
    "",
    `Subtotal: ${rs(order.subtotal)}`,
    `Delivery (${order.shippingLabel}): ${
      order.shippingFee === 0 ? "FREE" : rs(order.shippingFee)
    }`,
    `TOTAL: ${rs(order.total)}`,
    `Payment: ${order.paymentLabel}`,
    `Deliver to: ${order.customer.name}, ${order.customer.address}, ${
      order.customer.city
    } — ${order.customer.phone}`,
    "",
    paymentNote(order),
  ];
  return lines.join("\n");
}

/** Build the email (text + HTML) for one recipient role. */
export function buildOrderEmail(
  order: Order,
  to: "customer" | "owner"
): OrderMailCopy {
  const itemsRows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eef1f5;color:#1e293b;">${esc(
          i.name
        )}${i.variantLabel ? `<br/><span style="color:#64748b;font-size:12px;">${esc(i.variantLabel)}</span>` : ""}</td>
        <td align="center" style="padding:10px 12px;border-bottom:1px solid #eef1f5;color:#475569;">${
          i.qty
        }</td>
        <td align="right" style="padding:10px 12px;border-bottom:1px solid #eef1f5;color:#475569;">${rs(
          i.unitPrice
        )}</td>
        <td align="right" style="padding:10px 12px;border-bottom:1px solid #eef1f5;color:#0f172a;font-weight:700;">${rs(
          i.unitPrice * i.qty
        )}</td>
      </tr>`
    )
    .join("\n");

  const totals = `
    <tr><td colspan="3" style="padding:8px 12px;color:#64748b;">Subtotal</td><td align="right" style="padding:8px 12px;color:#0f172a;">${rs(
      order.subtotal
    )}</td></tr>
    <tr><td colspan="3" style="padding:8px 12px;color:#64748b;">Delivery (${esc(
      order.shippingLabel
    )})</td><td align="right" style="padding:8px 12px;color:#0f172a;">${
      order.shippingFee === 0 ? "FREE" : rs(order.shippingFee)
    }</td></tr>
    <tr><td colspan="3" style="padding:10px 12px;color:#0f172a;font-size:16px;font-weight:700;">Total</td><td align="right" style="padding:10px 12px;color:#E04D00;font-size:16px;font-weight:800;">${rs(
      order.total
    )}</td></tr>`;

  const head = to === "owner"
    ? `New order ${order.ref} from ${esc(order.customer.name)} — ${rs(order.total)}`
    : `Your ${order.ref} order is confirmed`;

  const text = [
    to === "owner" ? `New order received: ${order.ref}` : `Thank you for your order ${order.ref}!`,
    "",
    ...order.items.map(
      (i) =>
        `• ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} × ${i.qty} — ${rs(
          i.unitPrice * i.qty
        )}`
    ),
    "",
    `Subtotal: ${rs(order.subtotal)}`,
    `Delivery (${order.shippingLabel}): ${
      order.shippingFee === 0 ? "FREE" : rs(order.shippingFee)
    }`,
    `Total: ${rs(order.total)} (${order.paymentLabel})`,
    "",
    `Customer: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Email: ${order.customer.email || "—"}`,
    `Address: ${order.customer.address}, ${order.customer.city}`,
    order.customer.notes ? `Notes: ${order.customer.notes}` : "",
    "",
    paymentNote(order),
    "",
    `${site.name} — ${site.address}`,
    `Phone/WhatsApp: ${site.phone} · Email: ${site.email}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;background:#eef1f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:#002B6B;padding:22px 26px;">
          <div style="color:#ffffff;font-size:22px;font-weight:800;">${esc(
            site.name
          )}</div>
          <div style="color:#fcd34d;font-size:12px;letter-spacing:1px;">${esc(
            site.tagline
          )}</div>
        </td></tr>
        <tr><td style="padding:26px;">
          <h2 style="margin:0 0 6px;color:#0f172a;font-size:20px;">${esc(head)}</h2>
          <p style="margin:0 0 18px;color:#64748b;font-size:13px;">Order <b style="color:#002B6B;">${esc(
            order.ref
          )}</b> · ${fmtDate(order.createdAt)} · ${esc(order.paymentLabel)}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
            <tr style="background:#f1f5f9;">
              <th align="left" style="padding:10px 12px;color:#475569;font-size:11px;text-transform:uppercase;">Item</th>
              <th align="center" style="padding:10px 12px;color:#475569;font-size:11px;">Qty</th>
              <th align="right" style="padding:10px 12px;color:#475569;font-size:11px;">Price</th>
              <th align="right" style="padding:10px 12px;color:#475569;font-size:11px;">Total</th>
            </tr>
            ${itemsRows}
            ${totals}
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;background:#f8fafc;border-radius:12px;font-size:13px;color:#1e293b;">
            <tr><td style="padding:14px 16px;">
              <b style="color:#0f172a;">Deliver to:</b> ${esc(
                order.customer.name
              )}<br/>
              ${esc(order.customer.address)}, ${esc(order.customer.city)}<br/>
              ${esc(order.customer.phone)}${order.customer.email ? ` · ${esc(order.customer.email)}` : ""}${
                order.customer.notes
                  ? `<br/><i>Note: ${esc(order.customer.notes)}</i>`
                  : ""
              }
            </td></tr>
          </table>

          <p style="margin-top:18px;background:#FFF3EB;border:1px solid #FFE3CC;border-radius:12px;padding:12px 14px;color:#E04D00;font-size:13px;">${esc(
            paymentNote(order)
          )}</p>

          <p style="margin-top:20px;color:#64748b;font-size:13px;line-height:1.6;">Questions about your order? Message us on WhatsApp ${esc(
            site.phone
          )} or reply to this email — ${esc(site.email)}.</p>
          <p style="color:#94a3b8;font-size:11px;margin-top:4px;">${esc(
            site.name
          )} · ${esc(site.address)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject: head, text, html };
}
