import { NextResponse } from "next/server";
import {
  deleteSessionById,
  duplicateSessionById,
  listSessions,
  updateSession,
} from "@/lib/admin/sessionStore";
import type { VisitorSession } from "@/lib/admin/types";

export const runtime = "nodejs";

type SessionMutationBody = {
  id?: string;
  sourceId?: string;
  count?: number;
  session?: Partial<VisitorSession>;
};

function parseBody(bodyText: string): SessionMutationBody {
  if (!bodyText) return {};
  try {
    return JSON.parse(bodyText) as SessionMutationBody;
  } catch {
    return {};
  }
}

function normalizeSessionPatch(session: Partial<VisitorSession> | undefined): Partial<VisitorSession> {
  if (!session) return {};

  const patch: Partial<VisitorSession> = {};

  if (typeof session.city === "string") patch.city = session.city;
  if (typeof session.country === "string") patch.country = session.country;
  if (typeof session.region === "string") patch.region = session.region;
  if (typeof session.source === "string") patch.source = session.source;
  if (typeof session.browser === "string") patch.browser = session.browser;
  if (typeof session.device === "string") patch.device = session.device;
  if (typeof session.duration === "string") patch.duration = session.duration;
  if (typeof session.timestamp === "string" && !Number.isNaN(new Date(session.timestamp).getTime())) {
    patch.timestamp = session.timestamp;
  }
  if (Number.isFinite(session.pages)) {
    patch.pages = Math.max(0, Number(session.pages));
  }

  return patch;
}

export async function GET() {
  const sessions = await listSessions();
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const body = parseBody(raw);
  const sourceId = typeof body.sourceId === "string" ? body.sourceId : "";
  const count = Number.isFinite(body.count) ? Number(body.count) : 1;

  if (!sourceId) {
    return NextResponse.json({ ok: false, error: "sourceId is required." }, { status: 400 });
  }

  const duplicated = await duplicateSessionById(sourceId, count);
  if (!duplicated) {
    return NextResponse.json({ ok: false, error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, sessions: duplicated, count: duplicated.length });
}

export async function PUT(request: Request) {
  const raw = await request.text();
  const body = parseBody(raw);
  const id = typeof body.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ ok: false, error: "id is required." }, { status: 400 });
  }

  const updated = await updateSession(id, normalizeSessionPatch(body.session));
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, session: updated });
}

export async function DELETE(request: Request) {
  const raw = await request.text();
  const body = parseBody(raw);
  const id = typeof body.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ ok: false, error: "id is required." }, { status: 400 });
  }

  const deleted = await deleteSessionById(id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
