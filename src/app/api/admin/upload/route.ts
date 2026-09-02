import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import { backendUploadFile } from "@/lib/admin/backend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  try {
    const fd = await req.formData();
    const file = (fd.get("image") || fd.get("file")) as File | null;
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { ok: false, error: "No image file provided (field 'image')." },
        { status: 400 }
      );
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    if (buf.byteLength === 0) {
      return NextResponse.json(
        { ok: false, error: "Empty file." },
        { status: 400 }
      );
    }
    const result = await backendUploadFile(buf, file.name || "image");
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Upload failed" },
        { status: result.status || 500 }
      );
    }
    const url = result.data?.url;
    if (!url) {
      return NextResponse.json(
        { ok: false, error: "Backend did not return an image URL." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 }
    );
  }
}
