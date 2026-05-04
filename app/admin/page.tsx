"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RotatingGlobe from "./RotatingGlobe";
import SessionsTable, { type TableSession } from "./SessionsTable";
import type { VisitorSession } from "@/lib/admin/types";

const geoDistribution = [
  { label: "Europe", value: 31, visitors: 2_841, color: "#1b4332" },
  { label: "North America", value: 24, visitors: 2_198, color: "#2d6a4f" },
  { label: "Asia", value: 21, visitors: 1_923, color: "#40916c" },
  { label: "South America", value: 11, visitors: 1_008, color: "#74c69d" },
  { label: "Oceania", value: 8, visitors: 733, color: "#b7e4c7" },
  { label: "Africa", value: 5, visitors: 458, color: "#d8f3dc" },
];

const visitSeries = {
  hourly: {
    labels: ["00", "04", "08", "12", "16", "20"],
    values: [22, 31, 78, 93, 86, 59],
  },
  daily: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [129, 140, 162, 176, 201, 128, 116],
  },
  weekly: {
    labels: ["W1", "W2", "W3", "W4", "W5", "W6"],
    values: [824, 859, 912, 998, 944, 1030],
  },
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [3021, 3128, 3382, 3604, 3550, 3721, 3899, 3988, 4102, 4300, 4422, 4579],
  },
  annual: {
    labels: ["2021", "2022", "2023", "2024", "2025", "2026"],
    values: [21110, 30882, 41200, 50950, 62111, 68832],
  },
  "all-time": {
    labels: ["Yr1", "Yr2", "Yr3", "Yr4", "Yr5", "Yr6", "Yr7", "Yr8"],
    values: [7200, 14012, 22110, 33290, 45120, 58912, 68030, 78244],
  },
} as const;

const sourceStats = [
  { source: "Google Search", visitors: 3842, share: 42, trend: "+8.2%" },
  { source: "Direct", visitors: 2013, share: 22, trend: "+3.0%" },
  { source: "Bing", visitors: 1210, share: 13, trend: "+4.7%" },
  { source: "LinkedIn", visitors: 872, share: 9, trend: "+12.3%" },
  { source: "Google Ads", visitors: 663, share: 7, trend: "+2.2%" },
  { source: "Referral", visitors: 572, share: 7, trend: "-1.1%" },
];

const ranges = ["hourly", "daily", "weekly", "monthly", "annual", "all-time"] as const;
type Range = (typeof ranges)[number];

type ChartMode = "bar" | "line";
const ARCHIVE_MONTHS = 12;

export default function AdminPage() {
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [range, setRange] = useState<Range>("monthly");
  const [chartMode, setChartMode] = useState<ChartMode>("bar");
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveMessage, setArchiveMessage] = useState("");

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

  async function reloadSessions() {
    const response = await fetch("/api/admin/sessions", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to refresh sessions");
    const data = (await response.json()) as { sessions: VisitorSession[] };
    setSessions(data.sessions);
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
  }, []);

  const chartData = range === "all-time" ? visitSeries["all-time"] : visitSeries[range];
  const maxValue = Math.max(...chartData.values, 1);

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
            <a href="#source" className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-muted transition hover:text-ink">
              Sources
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
                sessions={sessions}
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
                      {activeSession.journey.map((step) => (
                        <span key={step.path} className="rounded-full border border-cream-dark bg-cream/50 px-3 py-1 text-ink-muted">
                          {step.path}
                        </span>
                      ))}
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
            {activeSession ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {activeSession.journey.map((step) => (
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
              <p className="mt-4 text-sm text-ink-faint">Select a session to inspect the journey timeline.</p>
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
            <SessionsTable
              sessions={tableSessions}
              activeSessionId={activeSession?.id ?? ""}
              onSessionClick={setActiveSessionId}
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
                  <svg viewBox="0 0 660 260" className="w-full" role="img" aria-label={`${range} visits chart`}>
                    <line x1="40" y1="220" x2="640" y2="220" stroke="#4a6076" strokeWidth="1" />
                    <line x1="40" y1="30" x2="40" y2="220" stroke="#4a6076" strokeWidth="1" />

                    {chartMode === "bar"
                      ? chartData.values.map((value, index) => {
                          const barWidth = 520 / chartData.values.length;
                          const x = 60 + index * barWidth;
                          const height = (value / maxValue) * 170;
                          const y = 220 - height;
                          return (
                            <rect
                              key={`${range}-${index}`}
                              x={x}
                              y={y}
                              width={Math.max(barWidth - 12, 10)}
                              height={height}
                              fill="rgb(var(--color-primary))"
                              rx={4}
                            />
                          );
                        })
                      : (() => {
                          const points = chartData.values
                            .map((value, index) => {
                              const step = 520 / Math.max(chartData.values.length - 1, 1);
                              const x = 60 + index * step;
                              const y = 220 - (value / maxValue) * 170;
                              return `${x},${y}`;
                            })
                            .join(" ");
                          return (
                            <>
                              <polyline
                                points={points}
                                fill="none"
                                stroke="rgb(var(--color-primary-dark))"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {chartData.values.map((value, index) => {
                                const step = 520 / Math.max(chartData.values.length - 1, 1);
                                const x = 60 + index * step;
                                const y = 220 - (value / maxValue) * 170;
                                return (
                                  <circle
                                    key={`${range}-pt-${index}`}
                                    cx={x}
                                    cy={y}
                                    r={4}
                                    fill="rgb(var(--color-primary-dark))"
                                  />
                                );
                              })}
                            </>
                          );
                        })()}

                    {chartData.labels.map((label, index) => {
                      const spread = 520 / Math.max(chartData.labels.length - 1, 1);
                      const x = 60 + index * spread;
                      return (
                        <text
                          key={`${range}-label-${label}`}
                          x={x}
                          y={244}
                          textAnchor="middle"
                          fontSize="11"
                          fill="#4a6076"
                        >
                          {label}
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

        {/* Source */}
        <section id="source" className="rounded-2xl border border-cream-dark bg-cream/20 p-6 md:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink-muted">3) Source</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-ink">Acquisition channels</h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-xl border border-cream-dark bg-surface p-5">
              <div className="grid grid-cols-4 border-b border-cream-dark pb-3 text-xs font-medium uppercase tracking-[0.22em] text-ink-muted">
                <span>Source</span>
                <span className="text-right">Visitors</span>
                <span className="text-right">Share</span>
                <span className="text-right">Trend</span>
              </div>
              <div className="mt-2 space-y-2">
                {sourceStats.map((row) => (
                  <div
                    key={row.source}
                    className="grid grid-cols-4 items-center rounded-lg px-2 py-2 text-sm hover:bg-cream/30"
                  >
                    <span className="font-medium text-ink">{row.source}</span>
                    <span className="text-right text-ink-muted">{row.visitors.toLocaleString()}</span>
                    <span className="text-right text-ink-muted">{row.share}%</span>
                    <span
                      className={`text-right font-medium ${
                        row.trend.startsWith("-") ? "text-red-600" : "text-green-700"
                      }`}
                    >
                      {row.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 rounded-xl border border-cream-dark bg-surface p-5">
              <h3 className="text-base font-semibold text-ink">Source intensity</h3>
              <div className="mt-4 space-y-4">
                {sourceStats.map((row) => (
                  <div key={`${row.source}-bar`}>
                    <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-ink-muted">
                      <span>{row.source}</span>
                      <span>{row.share}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-cream/60">
                      <div
                        className="h-2 rounded-full bg-forest"
                        style={{ width: `${row.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
