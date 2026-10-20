// Server-only access to the shared site settings stored in data/settings.json.
// Used by /api/settings and by the root layout, which renders the saved theme
// and text overrides into the initial HTML so the page doesn't flash defaults.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { DEFAULT_PRIMARY, DEFAULT_FONT_OPTION } from "@/lib/themeOptions";

const DATA_DIR = join(process.cwd(), "data");
const SETTINGS_FILE = join(DATA_DIR, "settings.json");

export interface SharedSettings {
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
  primaryColor: DEFAULT_PRIMARY,
  savedColors: [],
  fontOptionId: DEFAULT_FONT_OPTION,
  pageTexts: {},
  pageColors: {},
  presets: [],
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readSettings(): SharedSettings {
  ensureDataDir();
  if (!existsSync(SETTINGS_FILE)) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(readFileSync(SETTINGS_FILE, "utf-8")) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function writeSettings(settings: SharedSettings) {
  ensureDataDir();
  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}
