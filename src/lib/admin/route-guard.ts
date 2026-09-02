import { NextResponse } from "next/server";
import { readSessionCookie, validateSession } from "./session";

export function isAdminRequest(req: Request): boolean {
  const header = req.headers.get("cookie");
  const token = readSessionCookie(header);
  return validateSession(token);
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Not authorized. Please sign in." },
    { status: 401 }
  );
}
