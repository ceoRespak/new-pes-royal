import { NextResponse } from "next/server";
import { createCustomer } from "@/lib/customers/store";
import {
  customerCookieOptions,
  CUSTOMER_COOKIE,
  issueCustomerToken,
} from "@/lib/customers/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const created = createCustomer({
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
    password: String(body.password ?? ""),
    city: String(body.city ?? ""),
    address: String(body.address ?? ""),
  });
  if (!created.ok || !created.customer) {
    return NextResponse.json({ ok: false, error: created.error }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, customer: created.customer });
  res.cookies.set(
    CUSTOMER_COOKIE,
    issueCustomerToken(created.customer.id),
    customerCookieOptions
  );
  return res;
}
