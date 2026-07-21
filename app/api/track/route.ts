import { NextResponse } from "next/server";
import { findSession, upsertSession } from "@/lib/admin/sessionStore";
import type { JourneyStep, VisitorSession } from "@/lib/admin/types";
import { lookupIpLocation } from "@/lib/admin/ipLocation";
import { parseSource, parseUserAgent } from "@/lib/admin/userAgent";

export const runtime = "nodejs";

const DEFAULT_THUMBNAIL = "/hero-bg.jpg";

type TrackPayload = {
  sessionId: string;
  path: string;
  label?: string;
};

const KNOWN_TRACK_PATHS = new Set([
  "/",
  "/contents",
  "/contact",
  "/dedication",
  "/insights",
  "/updates",
]);

function isKnownTrackPath(path: string): boolean {
  if (KNOWN_TRACK_PATHS.has(path)) return true;
  if (/^\/chapter\/\d+$/.test(path)) return true;
  if (/^\/appendix\/\d+$/.test(path)) return true;
  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function nowHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function isValidSessionId(id: unknown): id is string {
  return typeof id === "string" && /^S-[A-Z0-9]{2,4}-[A-Za-z0-9]{4,16}$/.test(id);
}

function safePath(p: unknown): string | null {
  if (typeof p !== "string") return null;
  if (!p.startsWith("/")) return null;
  if (p.length > 256) return null;
  // Don't track admin / api routes.
  if (p.startsWith("/admin") || p.startsWith("/api/")) return null;
  if (!isKnownTrackPath(p)) return null;
  return p;
}

function safeLabel(label: unknown, path: string): string {
  if (typeof label === "string" && label.length > 0 && label.length <= 64) return label;
  if (path === "/" || path === "") return "Home";
  const seg = path.split("/").filter(Boolean)[0] ?? "Page";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

export async function POST(request: Request) {
  let body: TrackPayload;
  try {
    body = (await request.json()) as TrackPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  if (!isValidSessionId(body.sessionId)) {
    return NextResponse.json({ ok: false, error: "Invalid session id" }, { status: 400 });
  }

  const path = safePath(body.path);
  if (!path) return NextResponse.json({ ok: true, skipped: true });
  const label = safeLabel(body.label, path);

  const existing = await findSession(body.sessionId);
  const ip = clientIp(request);

  // Compute updated duration and journey
  const nowIso = new Date().toISOString();

  if (existing) {
    const startedAt = new Date(existing.timestamp).getTime();
    const elapsed = Math.max(0, Math.round((Date.now() - startedAt) / 1000));

    const last = existing.journey[existing.journey.length - 1];
    const journey: JourneyStep[] = last && last.path === path
      ? existing.journey
      : [
          ...existing.journey,
          { path, label, at: nowHHMM(), thumbnail: DEFAULT_THUMBNAIL },
        ];

    const updated: VisitorSession = {
      ...existing,
      duration: formatDuration(elapsed),
      pages: journey.length,
      journey,
    };

    await upsertSession(updated);
    return NextResponse.json({ ok: true });
  }

  // First beacon for this session id -> resolve geo + UA once.
  const ua = request.headers.get("user-agent");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host") ?? "";
  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;

  const [geo, agent] = await Promise.all([
    lookupIpLocation(ip),
    Promise.resolve(parseUserAgent(ua)),
  ]);

  const session: VisitorSession = {
    id: body.sessionId,
    country: geo.country,
    city: geo.city,
    region: geo.region,
    source: parseSource(referer, origin),
    browser: agent.browser,
    device: agent.device,
    duration: formatDuration(0),
    timestamp: nowIso,
    pages: 1,
    coordinates: geo.coordinates,
    journey: [{ path, label, at: nowHHMM(), thumbnail: DEFAULT_THUMBNAIL }],
    ip: geo.isPrivate ? "local" : geo.ip,
  };

  await upsertSession(session);
  return NextResponse.json({ ok: true });
}
