/**
 * Order email delivery via SMTP (nodemailer).
 *
 * Reads credentials from env vars so they are never committed:
 *   SMTP_HOST, SMTP_PORT (default 465), SMTP_SECURE ("true"/"false", default
 *   true for 465), SMTP_USER, SMTP_PASS, SMTP_FROM (defaults to site email),
 *   ORDER_EMAILS_TO (owner inbox; comma separated — defaults to site email).
 *
 * If SMTP is not configured the module is a safe no-op — the order still
 * succeeds; we just log that no email was sent.
 */

import "server-only";
import nodemailer from "nodemailer";
import type { Order } from "@/types";
import { site } from "@/data/site";
import { buildOrderEmail } from "./order-email";

const cleanEmails = (v?: string): string[] =>
  (v ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

function smtpEnabled(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function makeTransporter() {
  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE !== "false"
      : port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function deliver(to: string, order: Order, role: "customer" | "owner") {
  const copy = buildOrderEmail(order, role);
  const transporter = makeTransporter();
  await transporter.sendMail({
    from: `"${site.name}" <${process.env.SMTP_FROM || site.email}>`,
    to,
    subject: copy.subject,
    text: copy.text,
    html: copy.html,
  });
}

/**
 * Send order confirmation emails to the customer (if an email was given) and
 * to the store owner. Never throws — notifications must not block checkout.
 * Returns a short status for logging/UI.
 */
export async function sendOrderEmails(order: Order): Promise<{
  sent: string[];
  note?: string;
}> {
  if (!smtpEnabled()) {
    return { sent: [], note: "Email skipped — SMTP is not configured." };
  }

  const sent: string[] = [];

  // 1) Customer confirmation
  const customerEmail = cleanEmails(order.customer.email ?? "")[0];
  if (customerEmail) {
    try {
      await deliver(customerEmail, order, "customer");
      sent.push(customerEmail);
    } catch (e) {
      console.warn("[order-email] customer mail failed:", String(e));
    }
  }

  // 2) Store owner notification
  const owners = cleanEmails(
    process.env.ORDER_EMAILS_TO || site.email
  );
  for (const owner of owners) {
    try {
      await deliver(owner, order, "owner");
      sent.push(owner);
    } catch (e) {
      console.warn("[order-email] owner mail failed:", String(e));
    }
  }

  return { sent };
}
