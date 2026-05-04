import fs from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import { seedSessions } from "./seedSessions";
import type { VisitorSession } from "./types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "sessions-db.json");

type SessionDb = {
  sessions: VisitorSession[];
};

async function ensureDb(): Promise<void> {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.mkdir(DB_DIR, { recursive: true });
    const initialDb: SessionDb = { sessions: seedSessions };
    await fs.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
  }
}

async function readDb(): Promise<SessionDb> {
  await ensureDb();
  const raw = await fs.readFile(DB_FILE, "utf8");
  return JSON.parse(raw) as SessionDb;
}

async function writeDb(db: SessionDb): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function listSessions(): Promise<VisitorSession[]> {
  const db = await readDb();
  return db.sessions;
}

export async function clearAllSessions(): Promise<{ cleared: number }> {
  const db = await readDb();
  const cleared = db.sessions.length;
  await writeDb({ sessions: [] });
  return { cleared };
}

function monthsAgoDate(months: number): Date {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return cutoff;
}

export async function archiveOlderThanMonths(months: number): Promise<{
  archivedRows: VisitorSession[];
  remainingRows: VisitorSession[];
  xlsBuffer: Buffer;
}> {
  const db = await readDb();
  const cutoff = monthsAgoDate(months);

  const archivedRows = db.sessions.filter((s) => new Date(s.timestamp) < cutoff);
  const remainingRows = db.sessions.filter((s) => new Date(s.timestamp) >= cutoff);

  const exportRows = archivedRows.map((s) => ({
    session_id: s.id,
    timestamp: s.timestamp,
    city: s.city,
    country: s.country,
    region: s.region,
    source: s.source,
    browser: s.browser,
    device: s.device,
    pages: s.pages,
    duration: s.duration,
    journey: s.journey.map((step) => `${step.at} ${step.label} (${step.path})`).join(" -> "),
    coordinates: `${s.coordinates[0]}, ${s.coordinates[1]}`,
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Archived Sessions");
  const xlsBuffer = Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xls" }));

  await writeDb({ sessions: remainingRows });

  return { archivedRows, remainingRows, xlsBuffer };
}
