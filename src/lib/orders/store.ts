import "server-only";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/types";
import { ORDER_REF_PREFIX } from "@/lib/checkout/config";

/**
 * Local order store — orders are persisted as JSON under /.data/
 * (gitignored, not served by Next). This mirrors how admin users,
 * content overrides and product variants are already stored locally:
 * zero native dependencies, safe on the shared cPanel Node host.
 *
 * NOTE: use a real database (SQLite/Postgres) if order volume grows —
 * a single JSON file is fine for a small shop.
 */

const DIR = join(process.cwd(), ".data");
const FILE = join(DIR, "orders.json");

type OrderInput = Omit<Order, "ref" | "createdAt" | "history" | "status"> & {
  status?: OrderStatus;
};

interface OrderFile {
  seq: number;
  orders: Order[];
}

function loadFile(): OrderFile {
  try {
    if (!existsSync(FILE)) return { seq: 0, orders: [] };
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as OrderFile;
    return {
      seq: Number(raw.seq) || 0,
      orders: Array.isArray(raw.orders) ? raw.orders : [],
    };
  } catch {
    return { seq: 0, orders: [] };
  }
}

function saveFile(file: OrderFile): void {
  mkdirSync(DIR, { recursive: true });
  // Write-then-rename to avoid a torn file if the process dies mid-write.
  const tmp = `${FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(file, null, 2), "utf8");
  renameSync(tmp, FILE);
}

/** All orders, newest first. */
export function getAllOrders(): Order[] {
  return [...loadFile().orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getOrderByRef(ref: string): Order | undefined {
  const { orders } = loadFile();
  return orders.find((o) => o.ref.toLowerCase() === ref.toLowerCase());
}

/** Create and persist a new order; returns the stored order. */
export function createOrder(input: OrderInput): Order {
  const file = loadFile();
  file.seq += 1;
  const ref = `${ORDER_REF_PREFIX}-${String(file.seq).padStart(5, "0")}`;
  const order: Order = {
    ...input,
    ref,
    createdAt: new Date().toISOString(),
    status: input.status ?? "pending",
    history: [{ at: new Date().toISOString(), to: input.status ?? "pending" }],
  };
  file.orders.unshift(order);
  saveFile(file);
  return order;
}

export function updateOrder(
  ref: string,
  patch: { status?: OrderStatus; paymentStatus?: PaymentStatus; by?: string }
): Order | undefined {
  const file = loadFile();
  const order = file.orders.find(
    (o) => o.ref.toLowerCase() === ref.toLowerCase()
  );
  if (!order) return undefined;
  let changed = false;
  if (patch.status && patch.status !== order.status) {
    order.status = patch.status;
    order.history = [
      ...(order.history ?? []),
      { at: new Date().toISOString(), to: patch.status, by: patch.by ?? "admin" },
    ];
    changed = true;
  }
  if (patch.paymentStatus && patch.paymentStatus !== order.paymentStatus) {
    order.paymentStatus = patch.paymentStatus;
    changed = true;
  }
  if (changed) saveFile(file);
  return order;
}

export function countOrdersByStatus(): Record<OrderStatus, number> {
  const base: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of getAllOrders()) base[o.status] += 1;
  return base;
}
