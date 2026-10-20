import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/admin/auth";
import { readSettings, writeSettings, type SharedSettings } from "@/lib/settings";

// ── GET — public, returns shared settings ──────────────────────────
export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings, {
    headers: { "Cache-Control": "no-store" },
  });
}

// ── POST — admin only, updates shared settings ─────────────────────
export async function POST(req: NextRequest) {
  if (!isAdminRequestAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settingsPayload = body as Partial<SharedSettings>;

    // Merge and persist settings
    const current = readSettings();
    const merged: SharedSettings = { ...current, ...settingsPayload };
    writeSettings(merged);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
