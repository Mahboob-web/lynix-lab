import { NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Uptime check. Reports database reachability without exposing details. */
export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ status: "ok", database: "not_configured" });
  try {
    await getDb().$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "ok" });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unreachable" }, { status: 503 });
  }
}
