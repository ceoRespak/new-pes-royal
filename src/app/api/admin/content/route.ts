import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/admin/route-guard";
import { getContent, saveContent } from "@/lib/content/store";
import { adminForSection } from "@/lib/admin/access";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!adminForSection(req, "content")) return unauthorizedResponse();
  return NextResponse.json({ ok: true, content: getContent() });
}

export async function PUT(req: Request) {
  if (!adminForSection(req, "content")) return unauthorizedResponse();
  try {
    const body = await req.json();
    const content = saveContent(body ?? {});
    return NextResponse.json({ ok: true, content });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save content." }, { status: 500 });
  }
}
