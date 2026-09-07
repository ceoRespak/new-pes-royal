import { NextResponse } from "next/server";
import { getAllOrders, updateOrder } from "@/lib/orders/store";
import { normalizePhone, sendWaText } from "@/lib/notify/whatsapp-ba";
import { site } from "@/data/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WaButtonMessage {
  type?: string;
  from?: string;
  button?: { text?: string; payload?: string };
}
interface WaWebhookBody {
  entry?: { changes?: { value?: { messages?: WaButtonMessage[] } }[] }[];
}

function orderForPhone(fromE164: string) {
  const orders = getAllOrders();
  return (
    orders.find(
      (o) =>
        (o.status === "pending" || o.status === "confirmed") &&
        normalizePhone(o.customer.phone) === fromE164
    ) ?? null
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (
    mode === "subscribe" &&
    token &&
    token === (process.env.WA_VERIFY_TOKEN || "")
  ) {
    return new NextResponse(challenge ?? "ok", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  let body: WaWebhookBody = {};
  try {
    body = (await req.json()) as WaWebhookBody;
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Always acknowledge quickly so Meta doesn't retry forever.
  void handleEvents(body);

  return NextResponse.json({ ok: true });
}

async function handleEvents(body: WaWebhookBody) {
  try {
    const entries = Array.isArray(body.entry) ? body.entry : [];
    for (const entry of entries) {
      for (const change of entry?.changes ?? []) {
        const messages = Array.isArray(change?.value?.messages)
          ? change.value.messages
          : [];
        for (const msg of messages) {
          if (msg?.type !== "button") continue;
          const from = normalizePhone(msg.from);
          const label = String(msg?.button?.text ?? msg?.button?.payload ?? "").toLowerCase();
          if (!from) continue;

          const order = orderForPhone(from);
          if (!order) continue;

          const cancel = label.includes("cancel");
          const next = cancel ? "cancelled" : "confirmed";
          updateOrder(order.ref, { status: next, by: "whatsapp" });

          const first = (order.customer.name || "there").trim().split(/\s+/)[0];
          const reply = cancel
            ? `Hi ${first},\n\nYour order ${order.ref} has been cancelled successfully. If there was any issue, please let us know — our team is here to help.`
            : `Thank you! Your order ${order.ref} is confirmed. We'll contact you shortly to arrange delivery. — ${site.name}`;
          await sendWaText(from, reply).catch(() => {});
        }
      }
    }
  } catch (e) {
    console.warn("[whatsapp-webhook]", String(e));
  }
}
