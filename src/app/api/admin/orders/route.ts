import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import {
  countOrdersByStatus,
  getAllOrders,
  updateOrder,
} from "@/lib/orders/store";
import type { OrderStatus, PaymentStatus } from "@/types";

export const runtime = "nodejs";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "refunded"];

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const orders = getAllOrders();
  return NextResponse.json({ ok: true, orders, counts: countOrdersByStatus() });
}

export async function PATCH(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  let body: { ref?: unknown; status?: unknown; paymentStatus?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const ref = String(body.ref ?? "");
  if (!ref) {
    return NextResponse.json({ ok: false, error: "Missing order ref" }, { status: 400 });
  }

  let status: OrderStatus | undefined;
  if (body.status !== undefined) {
    if (!ORDER_STATUSES.includes(body.status as OrderStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    status = body.status as OrderStatus;
  }
  let paymentStatus: PaymentStatus | undefined;
  if (body.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus as PaymentStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid payment status" }, { status: 400 });
    }
    paymentStatus = body.paymentStatus as PaymentStatus;
  }

  const updated = updateOrder(ref, { status, paymentStatus, by: "admin" });
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order: updated });
}
