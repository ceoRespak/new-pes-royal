import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/admin/route-guard";
import { backendPost, clearCache } from "@/lib/admin/backend";
import {
  normalizeVariants,
  saveVariantsForProduct,
} from "@/lib/admin/variants-store";
import { clearLiveCache } from "@/lib/store/live";
import { adminForProductCategory } from "@/lib/admin/access";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown> | null = null;
  try {
    body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  } catch {
    body = null;
  }
  const access = adminForProductCategory(req, String(body?.category ?? ""));
  if (!access) return unauthorizedResponse();
  body = body ?? {};

  const productId = String(body.id ?? Date.now());
  const variants = normalizeVariants(body.variants);

  // Local-store payload.
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
    features: body.features,
    specs: body.specs,
    downloads: body.downloads,
    videos: body.videos,
    warranty: String(body.warranty ?? ""),
  };

  const result = await backendPost("/api/products", payload);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Create failed" },
      { status: result.status || 500 }
    );
  }
  // Persist variants only after the product exists in the local store.
  if (variants.length) saveVariantsForProduct(productId, variants);
  clearCache();
  clearLiveCache();
  return NextResponse.json({ ok: true, data: result.data });
}
