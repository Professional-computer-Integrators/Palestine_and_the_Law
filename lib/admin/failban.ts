import fs from "node:fs/promises";
import path from "node:path";

export type FailRecord = {
  timestamp: number;
};

export type LockoutRecord = {
  lockedUntil: number;
  failCount: number;
};

type FailBanDb = {
  failures: Record<string, FailRecord[]>;
  lockouts: Record<string, LockoutRecord>;
};

const DB_DIR = path.join(process.cwd(), "data");
const FAILBAN_FILE = path.join(DB_DIR, "failban.json");

const FAIL_THRESHOLD = 5;
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

async function ensureFailBanDb(): Promise<void> {
  try {
    await fs.access(FAILBAN_FILE);
  } catch {
    await fs.mkdir(DB_DIR, { recursive: true });
    const initialDb: FailBanDb = { failures: {}, lockouts: {} };
    await fs.writeFile(FAILBAN_FILE, JSON.stringify(initialDb, null, 2), "utf8");
  }
}

async function readFailBanDb(): Promise<FailBanDb> {
  await ensureFailBanDb();
  const raw = await fs.readFile(FAILBAN_FILE, "utf8");
  return JSON.parse(raw) as FailBanDb;
}

async function writeFailBanDb(db: FailBanDb): Promise<void> {
  await fs.writeFile(FAILBAN_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function isIpLockedOut(ip: string): Promise<boolean> {
  const db = await readFailBanDb();
  const lockout = db.lockouts[ip];

  if (!lockout) return false;

  const now = Date.now();
  if (lockout.lockedUntil <= now) {
    delete db.lockouts[ip];
    await writeFailBanDb(db);
    return false;
  }

  return true;
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  const db = await readFailBanDb();
  const now = Date.now();

  if (!db.failures[ip]) {
    db.failures[ip] = [];
  }

  db.failures[ip].push({ timestamp: now });

  const recentFailures = db.failures[ip].filter(
    (f) => now - f.timestamp < FAIL_WINDOW_MS
  );

  db.failures[ip] = recentFailures;

  if (recentFailures.length >= FAIL_THRESHOLD) {
    db.lockouts[ip] = {
      lockedUntil: now + LOCKOUT_DURATION_MS,
      failCount: recentFailures.length,
    };
    db.failures[ip] = [];
  }

  await writeFailBanDb(db);
}

export async function clearFailureRecord(ip: string): Promise<void> {
  const db = await readFailBanDb();
  delete db.failures[ip];
  await writeFailBanDb(db);
}
