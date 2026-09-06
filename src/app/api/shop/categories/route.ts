import { NextResponse } from "next/server";
import type { CategoryMeta } from "@/types";
import { getLiveCategories } from "@/lib/store/live";
import { categories as snapshotCategories } from "@/data/categories";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Lightweight category feed for the site Navbar mega-menu (client-fetched).
 * Returns the FULL live category list (with counts + accent colours); falls
 * back to the imported snapshot if the backend is unreachable.
 */
export async function GET() {
  try {
    const cats = await getLiveCategories();
    if (cats.length) {
      return NextResponse.json({ ok: true, categories: cats });
    }
  } catch {
    /* offline → snapshot below */
  }
  return NextResponse.json({ ok: true, categories: snapshotCategories });
}
