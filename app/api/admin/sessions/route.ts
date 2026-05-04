import { NextResponse } from "next/server";
import { listSessions } from "@/lib/admin/sessionStore";

export const runtime = "nodejs";

export async function GET() {
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}
