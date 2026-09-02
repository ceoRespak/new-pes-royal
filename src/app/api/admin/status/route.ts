import { NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin/route-guard";
import {
  backendConnectionInfo,
  backendTestLogin,
} from "@/lib/admin/backend";

export const runtime = "nodejs";

/** Reports whether the live backend is reachable + admin can authenticate. */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return unauthorizedResponse();
  const connection = backendConnectionInfo();
  const login = await backendTestLogin();
  return NextResponse.json({ ok: login.ok, connection, login });
}
