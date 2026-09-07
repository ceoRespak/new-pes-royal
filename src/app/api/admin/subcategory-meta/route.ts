import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/admin/route-guard";
import { getRawCategories } from "@/lib/catalog/store";
import {
  mergedTypesFor,
  saveSubcatsCategory,
} from "@/lib/catalog/subcats";
import { adminForSection } from "@/lib/admin/access";

export const runtime = "nodejs";

/**
 * GET /api/admin/subcategory-meta
 * Returns the admin-editable Shop-by-Type cards for every category, with each
 * type's default + admin-set image/name already merged (so the editor can show
 * current state without knowing the code defaults).
 */
export async function GET(req: Request) {
  if (!adminForSection(req, "categories")) return unauthorizedResponse();
  try {
    const cats = getRawCategories();
    const categories = cats.map((c) => ({
      name: c.name,
      id: c.id,
      types: mergedTypesFor(c.name),
    }));
    return NextResponse.json({ ok: true, categories });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

/**
 * PUT /api/admin/subcategory-meta
 * Body: { category: "<display name>", items: [{ id, name?, image? }] }
 * Persists the type-card overrides (images / display names) for one category.
 */
export async function PUT(req: Request) {
  if (!adminForSection(req, "categories")) return unauthorizedResponse();
  try {
    const body = (await req.json()) as {
      category?: string;
      items?: { id: string; name?: string; image?: string | null }[];
    };
    if (!body?.category) {
      return NextResponse.json(
        { ok: false, error: "Missing category name." },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.items)) {
      return NextResponse.json(
        { ok: false, error: "Missing items array." },
        { status: 400 }
      );
    }
    saveSubcatsCategory(body.category, body.items);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
