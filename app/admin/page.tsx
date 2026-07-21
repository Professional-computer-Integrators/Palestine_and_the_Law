"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RotatingGlobe from "./RotatingGlobe";
import SessionsTable, { type TableSession } from "./SessionsTable";
import type { VisitorSession } from "@/lib/admin/types";
import { coordinatesFromLocation } from "@/lib/admin/locationCoordinates";
import { useTheme } from "@/contexts/ThemeContext";

type GeoSegment = { label: string; value: number; visitors: number; color: string };
type VisitSeries = { labels: string[]; values: number[] };
type Range = "hourly" | "daily" | "weekly" | "monthly" | "annual" | "all-time";

const ranges: Range[] = ["hourly", "daily", "weekly", "monthly", "annual", "all-time"];

const GEO_COLORS = ["#315e77", "#b7791f", "#6b8e23", "#a3543f", "#765285", "#4f7c72"];

function validSessions(sessions: VisitorSession[]): VisitorSession[] {
  return sessions.filter((session) => !Number.isNaN(new Date(session.timestamp).getTime()));
}

function countBy<T>(items: T[], keyFor: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = keyFor(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return counts;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
}

function weekKey(date: Date): string {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  return start.toISOString().slice(0, 10);
}

function filterSessionsByRange(sessions: VisitorSession[], range: Range): VisitorSession[] {
  if (range === "all-time") return validSessions(sessions);

  const now = Date.now();
  const windowMsByRange: Record<Exclude<Range, "all-time">, number> = {
    hourly: 24 * 60 * 60 * 1000,
    daily: 30 * 24 * 60 * 60 * 1000,
    weekly: 12 * 7 * 24 * 60 * 60 * 1000,
    monthly: 365 * 24 * 60 * 60 * 1000,
    annual: 5 * 365 * 24 * 60 * 60 * 1000,
  };

  const cutoff = now - windowMsByRange[range];
  return validSessions(sessions).filter((session) => {
    const ts = new Date(session.timestamp).getTime();
    return Number.isFinite(ts) && ts >= cutoff;
  });
}

function buildVisitSeries(sessions: VisitorSession[], range: Range): VisitSeries {
  const dated = validSessions(sessions);
  const buckets = new Map<string, number>();
  const labels = new Map<string, string>();

  dated.forEach((session) => {
    const date = new Date(session.timestamp);
    let key: string;
    let label: string;

    if (range === "hourly") {
      key = String(date.getUTCHours()).padStart(2, "0");
      label = `${key}:00`;
    } else if (range === "daily") {
      key = date.toISOString().slice(0, 10);
      label = formatDay(date);
    } else if (range === "weekly") {
      key = weekKey(date);
      label = `Week of ${formatDay(new Date(`${key}T00:00:00Z`))}`;
    } else if (range === "monthly") {
      key = date.toISOString().slice(0, 7);
      label = date.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
    } else {
      key = String(date.getUTCFullYear());
      label = key;
    }

    buckets.set(key, (buckets.get(key) ?? 0) + 1);
    labels.set(key, label);
  });

  const keys = [...buckets.keys()].sort();
  return {
    labels: keys.map((key) => labels.get(key) ?? key),
    values: keys.map((key) => buckets.get(key) ?? 0),
  };
}

function buildGeoDistribution(sessions: VisitorSession[], range: Range): GeoSegment[] {
  const scoped = filterSessionsByRange(sessions, range);
  const counts = [...countBy(scoped, (session) => session.country || "Unknown").entries()]
    .sort(([, left], [, right]) => right - left);

  const total = counts.reduce((sum, [, count]) => sum + count, 0);
  const top = counts.slice(0, 6);
  const otherVisitors = counts.slice(6).reduce((sum, [, visitors]) => sum + visitors, 0);

  const segments = top.map(([label, visitors], index) => ({
    label,
    visitors,
    value: total === 0 ? 0 : Math.round((visitors / total) * 100),
    color: GEO_COLORS[index],
  }));

  if (otherVisitors > 0) {
    segments.push({
      label: "Other",
      visitors: otherVisitors,
      value: total === 0 ? 0 : Math.round((otherVisitors / total) * 100),
      color: "#5f6b7a",
    });
  }

  return segments;
}

type ChartMode = "bar" | "line";
const ARCHIVE_MONTHS = 12;

const KNOWN_STATIC_PATHS = new Set([
  "/",
  "/contents",
  "/contact",
  "/dedication",
  "/insights",
  "/updates",
]);

function isKnownSitePath(path: string): boolean {
  if (KNOWN_STATIC_PATHS.has(path)) return true;
  if (/^\/chapter\/\d+$/.test(path)) return true;
  if (/^\/appendix\/\d+$/.test(path)) return true;
  return false;
}

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin } = useTheme();
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [range, setRange] = useState<Range>("monthly");
  const [chartMode, setChartMode] = useState<ChartMode>("bar");
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveMessage, setArchiveMessage] = useState("");
  const [sessionActionMessage, setSessionActionMessage] = useState("");
  const [editingSessionId, setEditingSessionId] = useState("");
  const [isMutatingSessionId, setIsMutatingSessionId] = useState("");

  // Gate the dashboard to admin users only. ThemeContext hydrates `isAdmin`
  // from sessionStorage on mount, so we wait one tick before redirecting.
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAuthChecked(true), 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (authChecked && !isAdmin) {
      router.replace("/");
    }
  }, [authChecked, isAdmin, router]);

  const archiveCutoff = useMemo(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - ARCHIVE_MONTHS);
    return cutoff;
  }, []);

  const archiveEligibleCount = useMemo(
    () => sessions.filter((item) => new Date(item.timestamp) < archiveCutoff).length,
    [archiveCutoff, sessions]
  );

  useEffect(() => {
    async function loadSessions() {
      setIsLoadingSessions(true);
      setArchiveMessage("");
      setSessionActionMessage("");

      try {
        const response = await fetch("/api/admin/sessions", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load sessions");
        }
        const data = (await response.json()) as { sessions: VisitorSession[] };
        setSessions(data.sessions);
        setActiveSessionId((prev) => prev || data.sessions[0]?.id || "");
      } catch {
        setArchiveMessage("Could not load sessions from the database.");
      } finally {
        setIsLoadingSessions(false);
      }
    }

    void loadSessions();
  }, []);

  const activeSession = useMemo(() => {
    const selectedId = sessions.some((item) => item.id === activeSessionId)
      ? activeSessionId
      : sessions[0]?.id;
    return sessions.find((item) => item.id === selectedId) ?? null;
  }, [activeSessionId, sessions]);

  const activeSessionJourney = useMemo(
    () => (activeSession ? activeSession.journey.filter((step) => isKnownSitePath(step.path)) : []),
    [activeSession]
  );

  async function reloadSessions() {
    const response = await fetch("/api/admin/sessions", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to refresh sessions");
    const data = (await response.json()) as { sessions: VisitorSession[] };
    setSessions(data.sessions);
    return data.sessions;
  }

  async function handleDuplicateSession(id: string, count = 1) {
    setIsMutatingSessionId(id);
    setSessionActionMessage("");
    try {
      const response = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: id, count }),
      });
      if (!response.ok) throw new Error("Duplicate failed");

      const data = (await response.json()) as { sessions: VisitorSession[]; count: number };
      await reloadSessions();
      const newestDuplicate = data.sessions[0];
      if (newestDuplicate) {
        setActiveSessionId(newestDuplicate.id);
        setEditingSessionId(newestDuplicate.id);
      }
      setSessionActionMessage(
        `Duplicated ${data.count} session${data.count === 1 ? "" : "s"}. You can edit and save them now.`
      );
    } catch {
      setSessionActionMessage("Failed to duplicate session.");
    } finally {
      setIsMutatingSessionId("");
    }
  }

  async function handleDeleteSession(id: string) {
    const confirmed = window.confirm("Delete this session permanently?");
    if (!confirmed) return;

    setIsMutatingSessionId(id);
    setSessionActionMessage("");
    try {
      const response = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Delete failed");

      const nextSessions = await reloadSessions();
      if (activeSessionId === id) {
        setActiveSessionId(nextSessions[0]?.id ?? "");
      }
      if (editingSessionId === id) {
        setEditingSessionId("");
      }
      setSessionActionMessage("Session deleted.");
    } catch {
      setSessionActionMessage("Failed to delete session.");
    } finally {
      setIsMutatingSessionId("");
    }
  }

  async function handleSaveSession(id: string, updates: Partial<TableSession>) {
    setIsMutatingSessionId(id);
    setSessionActionMessage("");
    try {
      const response = await fetch("/api/admin/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, session: updates }),
      });
      if (!response.ok) throw new Error("Save failed");

      await reloadSessions();
      setEditingSessionId("");
      setSessionActionMessage("Session changes saved.");
    } catch {
      setSessionActionMessage("Failed to save session changes.");
      throw new Error("Save failed");
    } finally {
      setIsMutatingSessionId("");
    }
  }

  async function handleSaveSessionsBatch(
    updates: Array<{ id: string; session: Partial<TableSession> }>
  ) {
    if (updates.length === 0) return;
    setSessionActionMessage("");

    try {
      for (const item of updates) {
        const response = await fetch("/api/admin/sessions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, session: item.session }),
        });
        if (!response.ok) throw new Error("Batch save failed");
      }

      await reloadSessions();
      setEditingSessionId("");
      setSessionActionMessage(
        `Saved ${updates.length} edited row${updates.length === 1 ? "" : "s"}.`
      );
    } catch {
      setSessionActionMessage("Failed to save all edited rows.");
      throw new Error("Batch save failed");
    }
  }

  async function handleArchiveOlderThan12Months() {
    setIsArchiving(true);
    setArchiveMessage("");

    try {
      const response = await fetch("/api/admin/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: ARCHIVE_MONTHS }),
      });

      if (!response.ok) throw new Error("Archive failed");

      const blob = await response.blob();
      const filenameMatch = response.headers
        .get("Content-Disposition")
        ?.match(/filename="?([^"]+)"?/i);
      const filename = filenameMatch?.[1] ?? `archived-sessions-${ARCHIVE_MONTHS}m.xls`;
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);

      const archivedCount = Number(response.headers.get("X-Archived-Count") ?? "0");
      setArchiveMessage(
        archivedCount > 0
          ? `Archived ${archivedCount} session${archivedCount === 1 ? "" : "s"} and downloaded XLS.`
          : "No sessions older than 12 months to archive."
      );

      await reloadSessions();
    } catch {
      setArchiveMessage("Archive failed. No data was removed.");
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      window.location.href = "/";
    }
  }

  const [isClearing, setIsClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState("");
  async function handleClearAllStats() {
    const confirmed = window.confirm(
      "This will permanently wipe ALL recorded visitor sessions and stats from the database. This action cannot be undone.\n\nAre you sure you want to continue?"
    );
    if (!confirmed) return;

    setIsClearing(true);
    setClearMessage("");
    try {
      const response = await fetch("/api/admin/clear", { method: "POST" });
      if (!response.ok) throw new Error("Clear failed");
      const data = (await response.json()) as { cleared?: number };
      setClearMessage(
        `Cleared ${data.cleared ?? 0} session${data.cleared === 1 ? "" : "s"}. The dashboard is now empty.`
      );
      await reloadSessions();
      setActiveSessionId("");
    } catch {
      setClearMessage("Failed to clear stats. No data was removed.");
    } finally {
      setIsClearing(false);
    }
  }

  const geoDistribution = useMemo(() => buildGeoDistribution(sessions, range), [sessions, range]);
  const visitSeries = useMemo(
    () => ({
      hourly: buildVisitSeries(sessions, "hourly"),
      daily: buildVisitSeries(sessions, "daily"),
      weekly: buildVisitSeries(sessions, "weekly"),
      monthly: buildVisitSeries(sessions, "monthly"),
      annual: buildVisitSeries(sessions, "annual"),
      "all-time": buildVisitSeries(sessions, "all-time"),
    }),
    [sessions]
  );

  const pieBackground = useMemo(() => {
    const result = geoDistribution.reduce(
      (acc, segment) => {
        const start = acc.current;
        const end = start + segment.value;
        return {
          current: end,
          stops: [...acc.stops, `${segment.color} ${start}% ${end}%`],
        };
      },
      { current: 0, stops: [] as string[] }
    );
    return `conic-gradient(${result.stops.join(",")})`;
  }, [geoDistribution]);

  const chartData = range === "all-time" ? visitSeries["all-time"] : visitSeries[range];
  const maxValue = Math.max(...chartData.values, 1);
  const chartLeft = 72;
  const chartTop = 24;
  const chartWidth = 548;
  const chartHeight = 172;
  const chartBottom = chartTop + chartHeight;
  const chartRight = chartLeft + chartWidth;
  const labelStep =
    chartData.labels.length > 16
      ? 4
      : chartData.labels.length > 10
        ? 3
        : chartData.labels.length > 6
          ? 2
          : 1;
  const rotateLabels = chartData.labels.length > 8;
  const yTickCount = 4;

  const chartPoints = chartData.values.map((value, index) => {
    const x =
      chartData.values.length === 1
        ? chartLeft + chartWidth / 2
        : chartLeft + (index * chartWidth) / (chartData.values.length - 1);
    const y = chartBottom - (value / maxValue) * chartHeight;
    return {
      index,
      x,
      y,
      value,
      label: chartData.labels[index] ?? String(index + 1),
    };
  });

  const tableSessions: TableSession[] = useMemo(
    () =>
      sessions.map((s) => ({
        id: s.id,
        city: s.city,
        country: s.country,
        region: s.region,
        source: s.source,
        browser: s.browser,
        device: s.device,
        duration: s.duration,
        timestamp: s.timestamp,
        pages: s.pages,
      })),
    [sessions]
  );

  const globeSessions = useMemo(
    () =>
      sessions.map((session) => ({
        ...session,
        coordinates: coordinatesFromLocation({
          city: session.city,
          region: session.region,
          country: session.country,
        }),
      })),
    [sessions]
  );

  return (
    <div className="flex min-h-screen flex-col bg-parchment text-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-cream-dark bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4 md:px-8">
          <Link href="/" className="font-serif text-2xl font-bold text-ink md:text-3xl">
            Palestine &amp; the Law
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#global-stats" className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-muted transition hover:text-ink">
              Global Stats
            </a>
            <a href="#site-stats" className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-muted transition hover:text-ink">
              Site Stats
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-muted transition hover:text-ink"
            >
              Logout
            </button>
            <Link href="/" className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-muted transition hover:text-ink">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] flex-1 space-y-14 px-6 py-10 md:px-8 md:py-14">
        {/* Hero */}
        <section className="rounded-2xl border border-cream-dark bg-surface p-8 shadow-md md:p-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink-muted">Admin</p>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-ink md:text-5xl">
            Visitor Intelligence Console
          </h1>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
            Unified analytics for where visitors come from, how they move through the site, and
            how traffic trends evolve from hourly snapshots to all-time totals.
          </p>

          <div className="mt-8 flex flex-col gap-3 rounded-xl border border-red-300/60 bg-red-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-red-900">
              <p className="font-semibold">Clear all stats</p>
              <p className="mt-1 text-red-800/80">
                Reminder: clicking this will permanently wipe every recorded
                visitor session and stat from the database. This action cannot be
                undone.
              </p>
              {clearMessage && (
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-red-900">{clearMessage}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearAllStats}
              disabled={isClearing}
              className="flex-shrink-0 rounded-full border border-red-600 bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isClearing ? "Clearing..." : "Clear all stats"}
            </button>
          </div>
        </section>

        {/* Global Stats */}
        <section id="global-stats" className="rounded-2xl border border-cream-dark bg-cream/30 p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink-muted">1) Global stats</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-ink">Live session globe</h2>
            </div>
            <p className="text-sm text-ink-muted">Click any activity dot to inspect that visitor session.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <RotatingGlobe
                sessions={globeSessions}
                activeSessionId={activeSession?.id ?? ""}
                onSessionClick={setActiveSessionId}
              />
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-xl border border-cream-dark bg-surface p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink-muted">Active session</p>
                {activeSession ? (
                  <>
                    <h3 className="mt-3 text-xl font-bold text-ink">
                      {activeSession.city}, {activeSession.country}
                    </h3>
                    <p className="mt-2 text-sm text-ink-muted">
                      {activeSession.source} · {activeSession.browser} · {activeSession.device}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">Session length: {activeSession.duration}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                      {activeSessionJourney.map((step) => (
                        <span key={step.path} className="rounded-full border border-cream-dark bg-cream/50 px-3 py-1 text-ink-muted">
                          {step.path}
                        </span>
                      ))}
                      {activeSessionJourney.length === 0 && (
                        <span className="rounded-full border border-cream-dark bg-cream/50 px-3 py-1 text-ink-muted">
                          No valid on-site journey steps
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-ink-faint">
                    No sessions in this view. Toggle to the other view or restore archived sessions.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Journey timeline */}
          <div className="mt-6 rounded-xl border border-cream-dark bg-surface p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink-muted">Journey timeline</p>
            {activeSession && activeSessionJourney.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {activeSessionJourney.map((step) => (
                  <article
                    key={`${activeSession.id}-${step.path}-${step.at}`}
                    className="overflow-hidden rounded-xl border border-cream-dark bg-parchment"
                  >
                    <div className="relative h-32 w-full">
                      <Image
                        src={step.thumbnail}
                        alt={step.label}
                        fill
                        sizes="(min-width: 768px) 30vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="text-xs uppercase tracking-[0.26em] text-ink-faint">{step.at}</p>
                      <h4 className="text-base font-semibold text-ink">{step.label}</h4>
                      <p className="text-sm text-ink-muted">Path: {step.path}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-faint">
                {activeSession
                  ? "No valid on-site journey steps for this session."
                  : "Select a session to inspect the journey timeline."}
              </p>
            )}
          </div>

          {/* Sessions management */}
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-cream-dark bg-surface px-4 py-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
              <span>In database: {sessions.length}</span>
              <button
                type="button"
                onClick={handleArchiveOlderThan12Months}
                disabled={archiveEligibleCount === 0 || isArchiving}
                className="ml-auto rounded-full border border-cream-dark px-3 py-1 transition hover:border-forest hover:text-forest disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isArchiving
                  ? "Archiving..."
                  : `Archive older than ${ARCHIVE_MONTHS} months (${archiveEligibleCount})`}
              </button>
            </div>
            {(isLoadingSessions || archiveMessage) && (
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                {isLoadingSessions ? "Loading sessions from database..." : archiveMessage}
              </p>
            )}
            {sessionActionMessage && (
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                {sessionActionMessage}
              </p>
            )}
            <SessionsTable
              sessions={tableSessions}
              activeSessionId={activeSession?.id ?? ""}
              onSessionClick={setActiveSessionId}
              onDuplicateSession={handleDuplicateSession}
              onDeleteSession={handleDeleteSession}
              onSaveSession={handleSaveSession}
              onSaveSessionsBatch={handleSaveSessionsBatch}
              editingSessionId={editingSessionId}
              isMutatingSessionId={isMutatingSessionId}
            />
          </div>
        </section>

        {/* Site Stats */}
        <section id="site-stats" className="rounded-2xl border border-cream-dark bg-surface p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink-muted">2) Site stats</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-ink">Traffic and geography charts</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Pie chart */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-cream-dark bg-parchment p-5">
                <h3 className="text-base font-semibold text-ink">Geographic distribution</h3>
                <div
                  className="mx-auto mt-5 h-52 w-52 rounded-full border border-cream-dark"
                  style={{ background: pieBackground }}
                />
                <ul className="mt-5 space-y-2 text-sm">
                  {geoDistribution.map((segment) => (
                    <li key={segment.label} className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-2 text-ink-muted">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                        {segment.label}
                      </span>
                      <span className="flex items-baseline gap-2">
                        <span className="font-semibold text-ink">{segment.visitors.toLocaleString()}</span>
                        <span className="text-ink-faint">{segment.value}%</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bar/line chart */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-cream-dark bg-parchment p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <h3 className="mr-auto text-base font-semibold text-ink">Visits over time</h3>
                  <div className="inline-flex rounded-full border border-cream-dark bg-cream/40 p-1 text-xs uppercase tracking-[0.2em]">
                    <button
                      type="button"
                      onClick={() => setChartMode("bar")}
                      className={`rounded-full px-3 py-1 transition ${
                        chartMode === "bar" ? "bg-forest text-white" : "text-ink-muted"
                      }`}
                    >
                      Bar
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMode("line")}
                      className={`rounded-full px-3 py-1 transition ${
                        chartMode === "line" ? "bg-forest text-white" : "text-ink-muted"
                      }`}
                    >
                      Line
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {ranges.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRange(option)}
                      className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition ${
                        range === option
                          ? "border-forest bg-forest text-white"
                          : "border-cream-dark bg-cream/30 text-ink-muted hover:border-forest/50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-cream-dark bg-cream/20 p-3">
                  <svg
                    viewBox="0 0 660 300"
                    className="w-full"
                    role="img"
                    aria-label={`${range} visits chart`}
                    onMouseLeave={() => setHoveredChartIndex(null)}
                  >
                    {[...Array(yTickCount + 1)].map((_, tickIndex) => {
                      const ratio = tickIndex / yTickCount;
                      const y = chartBottom - ratio * chartHeight;
                      const tickValue = Math.round(maxValue * ratio);
                      return (
                        <g key={`y-tick-${tickIndex}`}>
                          <line
                            x1={chartLeft}
                            y1={y}
                            x2={chartRight}
                            y2={y}
                            stroke="rgba(74,96,118,0.24)"
                            strokeWidth="1"
                          />
                          <text
                            x={chartLeft - 10}
                            y={y + 4}
                            textAnchor="end"
                            fontSize="11"
                            fill="#4a6076"
                          >
                            {tickValue}
                          </text>
                        </g>
                      );
                    })}

                    <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom} stroke="#4a6076" strokeWidth="1" />
                    <line x1={chartLeft} y1={chartTop} x2={chartLeft} y2={chartBottom} stroke="#4a6076" strokeWidth="1" />

                    <text
                      x="20"
                      y={chartTop + chartHeight / 2}
                      transform={`rotate(-90 20 ${chartTop + chartHeight / 2})`}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#4a6076"
                    >
                      Visits
                    </text>

                    {chartMode === "bar"
                      ? chartPoints.map((point) => {
                          const barSlot = chartWidth / Math.max(chartPoints.length, 1);
                          const barWidth = Math.max(Math.min(barSlot * 0.68, 38), 10);
                          const barHeight = chartBottom - point.y;
                          return (
                            <rect
                              key={`${range}-${point.index}`}
                              x={point.x - barWidth / 2}
                              y={point.y}
                              width={barWidth}
                              height={barHeight}
                              fill="rgb(var(--color-primary))"
                              rx={4}
                              onMouseEnter={() => setHoveredChartIndex(point.index)}
                            >
                              <title>{`${point.label}: ${point.value}`}</title>
                            </rect>
                          );
                        })
                      : (
                        <>
                          <polyline
                            points={chartPoints.map((point) => `${point.x},${point.y}`).join(" ")}
                            fill="none"
                            stroke="rgb(var(--color-primary-dark))"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {chartPoints.map((point) => (
                            <g key={`${range}-pt-${point.index}`}>
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r={4}
                                fill="rgb(var(--color-primary-dark))"
                              />
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r={10}
                                fill="transparent"
                                onMouseEnter={() => setHoveredChartIndex(point.index)}
                              >
                                <title>{`${point.label}: ${point.value}`}</title>
                              </circle>
                            </g>
                          ))}
                        </>
                      )}

                    {hoveredChartIndex !== null && chartPoints[hoveredChartIndex] && (
                      <g>
                        <circle
                          cx={chartPoints[hoveredChartIndex].x}
                          cy={chartPoints[hoveredChartIndex].y}
                          r={6}
                          fill="rgb(var(--color-primary-light))"
                          stroke="white"
                          strokeWidth={2}
                        />
                        <rect
                          x={Math.max(chartLeft, chartPoints[hoveredChartIndex].x - 54)}
                          y={Math.max(chartTop, chartPoints[hoveredChartIndex].y - 36)}
                          width="108"
                          height="20"
                          rx="4"
                          fill="rgba(26,45,63,0.92)"
                        />
                        <text
                          x={Math.max(chartLeft, chartPoints[hoveredChartIndex].x - 54) + 54}
                          y={Math.max(chartTop, chartPoints[hoveredChartIndex].y - 36) + 14}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#eef4f9"
                        >
                          {chartPoints[hoveredChartIndex].value} visits
                        </text>
                      </g>
                    )}

                    {chartPoints.map((point) => {
                      if (point.index % labelStep !== 0 && point.index !== chartPoints.length - 1) {
                        return null;
                      }
                      const labelY = rotateLabels ? chartBottom + 28 : chartBottom + 22;
                      return (
                        <text
                          key={`${range}-label-${point.label}-${point.index}`}
                          x={point.x}
                          y={labelY}
                          textAnchor={rotateLabels ? "end" : "middle"}
                          transform={rotateLabels ? `rotate(-35 ${point.x} ${labelY})` : undefined}
                          fontSize="11"
                          fill="#4a6076"
                        >
                          {point.label}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                <p className="mt-4 text-sm text-ink-muted">
                  Showing {range} visitor totals with {chartMode} visualization.
                  {range === "all-time"
                    ? " All-time includes archived and active history from inception."
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
