import { NextResponse } from "next/server";
import { clearAllSessions } from "@/lib/admin/sessionStore";

export const runtime = "nodejs";

export async function POST() {
  const { cleared } = await clearAllSessions();
  return NextResponse.json({ ok: true, cleared });
}
