import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import {
  backendGet,
  backendPut,
  clearCache,
  maybeParse,
  maybeStringify,
} from "@/lib/admin/backend";
import { clearLiveCache } from "@/lib/store/live";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const result = await backendGet<Record<string, unknown>>("/api/settings");
  if (!result.ok || !result.data) {
    return NextResponse.json(
      { ok: false, error: result.error || "Could not load settings" },
      { status: result.status || 500 }
    );
  }
  // return a UI-friendly copy (JSON-encoded arrays parsed)
  const data = { ...result.data };
  for (const k of Object.keys(data)) {
    data[k] = maybeParse(data[k]);
  }
  return NextResponse.json({ ok: true, data });
}

export async function PUT(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  let body: { edits?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const edits = body.edits ?? {};

  const current = await backendGet<Record<string, unknown>>("/api/settings");
  if (!current.ok || !current.data) {
    return NextResponse.json(
      { ok: false, error: current.error || "Could not load current settings" },
      { status: current.status || 500 }
    );
  }
  const full = { ...current.data };
  for (const key of Object.keys(edits)) {
    full[key] = maybeStringify(edits[key]);
  }
  const result = await backendPut("/api/settings", full);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Update failed" },
      { status: result.status || 500 }
    );
  }
  clearCache();
  clearLiveCache();
  return NextResponse.json({ ok: true, data: result.data });
}
