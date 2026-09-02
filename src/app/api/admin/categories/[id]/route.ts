import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import { backendDelete, backendPut, clearCache } from "@/lib/admin/backend";

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
  const payload = {
    id: params.id,
    name: String(body.name ?? ""),
    image: String(body.image ?? ""),
    sort_order: Number(body.sort_order ?? 0),
  };
  // The live backend updates categories via PUT /api/categories (id in body).
  const result = await backendPut("/api/categories", payload);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Update failed" },
      { status: result.status || 500 }
    );
  }
  clearCache();
  return NextResponse.json({ ok: true, data: result.data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(_req)) return unauthorizedResponse();
  const result = await backendDelete(`/api/categories/${params.id}`);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Delete failed" },
      { status: result.status || 500 }
    );
  }
  clearCache();
  return NextResponse.json({ ok: true });
}
