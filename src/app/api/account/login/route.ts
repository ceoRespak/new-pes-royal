import { NextResponse } from "next/server";
import { verifyCustomer } from "@/lib/customers/store";
import {
  customerCookieOptions,
  CUSTOMER_COOKIE,
  issueCustomerToken,
} from "@/lib/customers/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const customer = verifyCustomer(email, password);
  if (!customer) {
    return NextResponse.json(
      { ok: false, error: "Wrong email or password." },
      { status: 401 }
    );
  }
  const res = NextResponse.json({ ok: true, customer });
  res.cookies.set(
    CUSTOMER_COOKIE,
    issueCustomerToken(customer.id),
    customerCookieOptions
  );
  return res;
}
