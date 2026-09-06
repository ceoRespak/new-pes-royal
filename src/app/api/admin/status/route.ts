import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import {
  getRawCategories,
  getRawProducts,
  getSettingsStore,
} from "@/lib/catalog/store";

export const runtime = "nodejs";

/** Reports the status of this site's own (self-hosted) store. */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const products = getRawProducts().length;
  const categories = getRawCategories().length;
  const settings = Boolean(getSettingsStore());
  return NextResponse.json({
    ok: true,
    connection: { local: true, productCount: products, categoryCount: categories },
    login: {
      info: `Local store ready — ${products} products, ${categories} categories${
        settings ? "" : " (settings not seeded yet)"
      }.`,
    },
  });
}
