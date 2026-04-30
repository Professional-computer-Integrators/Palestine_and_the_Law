import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const SETTINGS_FILE = join(DATA_DIR, "settings.json");
const ADMIN_FILE = join(DATA_DIR, "admin.json");

interface SharedSettings {
  updates: { id: string; title: string; content: string; date: string }[];
  primaryColor: string;
  fontOptionId: string;
}

const DEFAULT_SETTINGS: SharedSettings = {
  updates: [],
  primaryColor: "#3a6491",
  fontOptionId: "classic",
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

function readAdminPassword(): string {
  ensureDataDir();
  if (existsSync(ADMIN_FILE)) {
    try {
      const data = JSON.parse(readFileSync(ADMIN_FILE, "utf-8"));
      if (data.password) return data.password;
    } catch {
      // fall through
    }
  }
  return process.env.ADMIN_PASSWORD ?? "password";
}

function writeAdminPassword(password: string) {
  ensureDataDir();
  writeFileSync(ADMIN_FILE, JSON.stringify({ password }), "utf-8");
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
  const providedPassword = req.headers.get("x-admin-password") ?? "";
  const storedPassword = readAdminPassword();

  if (!providedPassword || providedPassword !== storedPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { newAdminPassword, ...settingsPayload } = body as {
      newAdminPassword?: string;
    } & Partial<SharedSettings>;

    // Update admin password if requested
    if (newAdminPassword) {
      writeAdminPassword(newAdminPassword);
    }

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
