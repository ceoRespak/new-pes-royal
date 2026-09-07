import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  parseCustomerId,
} from "@/lib/customers/session";
import { getCustomerPublic } from "@/lib/customers/store";

export const runtime = "nodejs";

function tokenFrom(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  for (const part of cookie.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === CUSTOMER_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function GET(req: Request) {
  const token = tokenFrom(req);
  const id = parseCustomerId(token);
  const customer = id ? getCustomerPublic(id) ?? null : null;
  return NextResponse.json({ ok: true, customer });
}
