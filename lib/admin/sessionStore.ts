import fs from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import { seedSessions } from "./seedSessions";
import type { VisitorSession } from "./types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "sessions-db.json");
const SESSION_SEED_VERSION = 2;
let dbLock: Promise<void> = Promise.resolve();

type SessionDb = {
  sessions: VisitorSession[];
  seeded?: boolean;
  seedVersion?: number;
};

async function withDbLock<T>(operation: () => Promise<T>): Promise<T> {
  const previous = dbLock;
  let release: () => void;
  dbLock = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    return await operation();
  } finally {
    release!();
  }
}

async function ensureDb(): Promise<void> {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.mkdir(DB_DIR, { recursive: true });
    const initialDb: SessionDb = {
      sessions: seedSessions,
      seeded: true,
      seedVersion: SESSION_SEED_VERSION,
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
  }
}

function addMissingSeedSessions(db: SessionDb): SessionDb {
  if (db.seedVersion === SESSION_SEED_VERSION || seedSessions.length === 0) return db;

  const existingIds = new Set(db.sessions.map((session) => session.id));
  const missingSeeds = seedSessions.filter((session) => !existingIds.has(session.id));
  return {
    sessions: [...missingSeeds, ...db.sessions],
    seeded: true,
    seedVersion: SESSION_SEED_VERSION,
  };
}

function recoverLegacyDb(raw: string): SessionDb | null {
  const sessionsKey = raw.indexOf('"sessions"');
  const arrayStart = raw.indexOf("[", sessionsKey);
  if (sessionsKey < 0 || arrayStart < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = arrayStart; index < raw.length; index += 1) {
    const character = raw[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === "[") {
      depth += 1;
    } else if (character === "]") {
      depth -= 1;
      if (depth === 0) {
        try {
          const sessions = JSON.parse(raw.slice(arrayStart, index + 1)) as VisitorSession[];
          return Array.isArray(sessions) ? { sessions, seeded: false } : null;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

async function readDb(): Promise<SessionDb> {
  await ensureDb();
  const raw = await fs.readFile(DB_FILE, "utf8");
  let db: SessionDb;

  try {
    db = JSON.parse(raw) as SessionDb;
  } catch (error) {
    const recovered = recoverLegacyDb(raw);
    if (!recovered) throw error;

    db = addMissingSeedSessions(recovered);
    await writeDb(db);
    return db;
  }

  // Add demonstration data once to databases created before seeding existed.
  // Later user-initiated clears set `seeded`, so the dashboard stays empty
  // until genuine new visits arrive.
  const seededDb = addMissingSeedSessions(db);
  if (seededDb !== db) {
    await writeDb(seededDb);
    return seededDb;
  }

  return db;
}

async function writeDb(db: SessionDb): Promise<void> {
  const tempFile = path.join(
    DB_DIR,
    `.sessions-db-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`
  );
  await fs.writeFile(tempFile, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tempFile, DB_FILE);
}

export async function listSessions(): Promise<VisitorSession[]> {
  return withDbLock(async () => (await readDb()).sessions);
}

export async function findSession(id: string): Promise<VisitorSession | undefined> {
  return withDbLock(async () => (await readDb()).sessions.find((session) => session.id === id));
}

/**
 * Insert a new session or replace the existing one with the same id.
 * Newly inserted sessions are placed at the front (most-recent first).
 */
export async function upsertSession(session: VisitorSession): Promise<void> {
  await withDbLock(async () => {
    const db = await readDb();
    const idx = db.sessions.findIndex((item) => item.id === session.id);
    if (idx >= 0) {
      db.sessions[idx] = session;
    } else {
      db.sessions.unshift(session);
    }
    await writeDb(db);
  });
}

export async function clearAllSessions(): Promise<{ cleared: number }> {
  return withDbLock(async () => {
    const db = await readDb();
    const cleared = db.sessions.length;
    await writeDb({ sessions: [], seeded: true, seedVersion: SESSION_SEED_VERSION });
    return { cleared };
  });
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
  return withDbLock(async () => {
    const db = await readDb();
    const cutoff = monthsAgoDate(months);

    const archivedRows = db.sessions.filter((session) => new Date(session.timestamp) < cutoff);
    const remainingRows = db.sessions.filter((session) => new Date(session.timestamp) >= cutoff);

    const exportRows = archivedRows.map((session) => ({
      session_id: session.id,
      timestamp: session.timestamp,
      city: session.city,
      country: session.country,
      region: session.region,
      source: session.source,
      browser: session.browser,
      device: session.device,
      pages: session.pages,
      duration: session.duration,
      journey: session.journey.map((step) => `${step.at} ${step.label} (${step.path})`).join(" -> "),
      coordinates: `${session.coordinates[0]}, ${session.coordinates[1]}`,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Archived Sessions");
    const xlsBuffer = Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xls" }));

    await writeDb({
      sessions: remainingRows,
      seeded: true,
      seedVersion: SESSION_SEED_VERSION,
    });

    return { archivedRows, remainingRows, xlsBuffer };
  });
}
