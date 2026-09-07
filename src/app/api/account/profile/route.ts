import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  parseCustomerId,
} from "@/lib/customers/session";
import { updateCustomerProfile } from "@/lib/customers/store";

export const runtime = "nodejs";

function tokenFrom(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  for (const part of cookie.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === CUSTOMER_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function PUT(req: Request) {
  const id = parseCustomerId(tokenFrom(req));
  if (!id) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  let body: { name?: string; phone?: string; city?: string; address?: string };
  try {
    body = (await req.json()) as {
      name?: string;
      phone?: string;
      city?: string;
      address?: string;
    };
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const updated = updateCustomerProfile(id, {
    name: body?.name,
    phone: body?.phone,
    city: body?.city,
    address: body?.address,
  });
  if (!updated.ok || !updated.customer) {
    return NextResponse.json(
      { ok: false, error: updated.error || "Update failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, customer: updated.customer });
}
