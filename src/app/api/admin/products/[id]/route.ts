import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/admin/route-guard";
import { backendDelete, backendPut, clearCache } from "@/lib/admin/backend";
import {
  normalizeVariants,
  saveVariantsForProduct,
} from "@/lib/admin/variants-store";
import { clearLiveCache } from "@/lib/store/live";
import { accessFromRequest, canSection, canCategory } from "@/lib/admin/access";
import { getRawProducts } from "@/lib/catalog/store";
import { isOwnerLike } from "@/lib/admin/users-store";

export const runtime = "nodejs";

function forbiddenResponse(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "You can only manage products in your assigned categories." },
    { status: 403 }
  );
}

/**
 * Verify the caller may manage a product by its existing store category
 * (owner/admin all-categories users pass; scoped managers only their scope).
 */
function canManageProductId(req: Request, id: string): boolean {
  const a = accessFromRequest(req);
  if (!a || !canSection(a, "products")) return false;
  const existing = getRawProducts().find((p) => String(p.id) === String(id));
  // A scoped manager can't manage products outside their scope.
  if (isOwnerLike(a.role)) return true;
  if (!a.categoryScope) return true;
  if (!existing) return true; // create-ish fallback — body check handles scope
  return canCategory(a, existing.category);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const access = accessFromRequest(req);
  if (!access || !canSection(access, "products")) return unauthorizedResponse();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const productId = params.id;
  const targetCategory = String(body.category ?? "");

  // Scope enforcement: if the product already exists, its current category
  // must be in scope; the new category (if provided) must be too.
  const existing = getRawProducts().find((p) => String(p.id) === String(productId));
  if (existing) {
    if (!canCategory(access, existing.category)) return forbiddenResponse();
  }
  if (targetCategory && !canCategory(access, targetCategory)) {
    return forbiddenResponse();
  }
  // A scoped manager cannot move a product into a category outside scope.
  if (!isOwnerLike(access.role) && access.categoryScope && targetCategory) {
    const inScope = access.categoryScope.some(
      (c) => c.toLowerCase() === targetCategory.toLowerCase()
    );
    if (!inScope) return forbiddenResponse();
  }

  const variants = normalizeVariants(body.variants);
  // Variants are owned by this site and persist in /.data.
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
    features: body.features,
    specs: body.specs,
    downloads: body.downloads,
    videos: body.videos,
    warranty: String(body.warranty ?? ""),
  };

  // Local store updates products via PUT /api/products (id inside body).
  const result = await backendPut("/api/products", payload);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `${result.error || "Save failed (local store)"}`, 
      },
      { status: result.status || 500 }
    );
  }
  clearLiveCache();
  return NextResponse.json({ ok: true, data: result.data });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!canManageProductId(req, params.id)) return unauthorizedResponse();
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
