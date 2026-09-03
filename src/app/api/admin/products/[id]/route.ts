import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import { backendDelete, backendPut, clearCache } from "@/lib/admin/backend";
import {
  normalizeVariants,
  saveVariantsForProduct,
} from "@/lib/admin/variants-store";
import { clearLiveCache } from "@/lib/store/live";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const productId = params.id;
  const variants = normalizeVariants(body.variants);
  // Variants are owned by this site (the live backend can't persist them).
  saveVariantsForProduct(productId, variants);
  clearCache();
  clearLiveCache();

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

  // The live backend updates products via PUT /api/products (id inside body).
  const result = await backendPut("/api/products", payload);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `${result.error || "Live update failed"}. (Variants were saved locally and will appear on this site.)`,
      },
      { status: result.status || 500 }
    );
  }
  clearLiveCache();
  return NextResponse.json({ ok: true, data: result.data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(_req)) return unauthorizedResponse();
  const result = await backendDelete(`/api/products/${params.id}`);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Delete failed" },
      { status: result.status || 500 }
    );
  }
  clearCache();
  return NextResponse.json({ ok: true });
}
