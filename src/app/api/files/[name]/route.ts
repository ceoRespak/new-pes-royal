import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { uploadsDir } from "@/lib/catalog/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXT_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
};

/** Serves images/files uploaded to this site's own storage (/.data/uploads). */
export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const name = basename(String(params.name ?? "")).replace(/[/\\]/g, "");
  if (!name) {
    return new NextResponse("Not found", { status: 404 });
  }
  const file = join(uploadsDir(), name);
  if (!existsSync(file)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const buf = readFileSync(file);
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  const type = EXT_MAP[ext] ?? "application/octet-stream";
  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
