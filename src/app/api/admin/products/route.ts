import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import { backendPost, clearCache } from "@/lib/admin/backend";
import {
  normalizeVariants,
  saveVariantsForProduct,
} from "@/lib/admin/variants-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const productId = String(body.id ?? Date.now());
  const variants = normalizeVariants(body.variants);

  // Live payload (the backend's variant table can't persist — kept locally)
  const payload = {
    id: productId,
    name: String(body.name ?? ""),
    desc: String(body.desc ?? ""),
    price: String(body.price ?? ""),
    sale_price: String(body.sale_price ?? ""),
    on_sale: Boolean(body.on_sale),
    badge: String(body.badge ?? ""),
    image: String(body.image ?? ""),
    category: String(body.category ?? ""),
    featured: Boolean(body.featured),
  };

  const result = await backendPost("/api/products", payload);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Create failed" },
      { status: result.status || 500 }
    );
  }
  // Only keep variants once the product itself exists on the live side.
  if (variants.length) saveVariantsForProduct(productId, variants);
  clearCache();
  return NextResponse.json({ ok: true, data: result.data });
}
