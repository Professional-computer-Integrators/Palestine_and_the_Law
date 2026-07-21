import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { isAdminRequestAuthenticated } from "@/lib/admin/auth";

const DATA_DIR = join(process.cwd(), "data");
const SETTINGS_FILE = join(DATA_DIR, "settings.json");

interface SharedSettings {
  updates: { id: string; title: string; content: string; date: string }[];
  primaryColor: string;
  savedColors: string[];
  fontOptionId: string;
  pageTexts: Record<string, string>;
  pageColors: Record<string, string>;
  presets: Array<{
    id: string;
    name: string;
    primaryColor: string;
    fontOptionId: string;
    pageTexts: Record<string, string>;
    pageColors: Record<string, string>;
    createdAt: string;
  }>;
}

const DEFAULT_SETTINGS: SharedSettings = {
  updates: [],
  primaryColor: "#3a6491",
  savedColors: [],
  fontOptionId: "classic",
  pageTexts: {},
  pageColors: {},
  presets: [],
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSettings(): SharedSettings {
  ensureDataDir();
  if (!existsSync(SETTINGS_FILE)) return { ...DEFAULT_SETTINGS };
  try {
    return JSON.parse(readFileSync(SETTINGS_FILE, "utf-8"));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

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
    ensureDataDir();
    writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
