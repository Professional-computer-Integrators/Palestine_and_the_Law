"use client";

import { useMemo, useState } from "react";

export type TableSession = {
  id: string;
  city: string;
  country: string;
  region: string;
  source: string;
  browser: string;
  device: string;
  duration: string;
  /** ISO-8601 date string e.g. "2026-05-04T10:02:00Z" */
  timestamp: string;
  pages: number;
};

type TimeFilter = "today" | "week" | "month" | "year" | "all";

const TIME_LABELS: Record<TimeFilter, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
  all: "All time",
};

function filterByTime(sessions: TableSession[], filter: TimeFilter): TableSession[] {
  if (filter === "all") return sessions;
  const now = new Date();
  const cutoff = new Date(now);
  if (filter === "today") cutoff.setHours(0, 0, 0, 0);
  else if (filter === "week") cutoff.setDate(now.getDate() - 7);
  else if (filter === "month") cutoff.setMonth(now.getMonth() - 1);
  else if (filter === "year") cutoff.setFullYear(now.getFullYear() - 1);
  return sessions.filter((s) => new Date(s.timestamp) >= cutoff);
}

type SortKey = keyof Pick<TableSession, "timestamp" | "country" | "source" | "duration" | "pages">;
type SortDir = "asc" | "desc";

function sortSessions(sessions: TableSession[], key: SortKey, dir: SortDir) {
  return [...sessions].sort((a, b) => {
    let av: string | number = a[key];
    let bv: string | number = b[key];
    if (key === "duration") {
      av = parseDuration(a.duration);
      bv = parseDuration(b.duration);
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

function parseDuration(d: string): number {
  const m = d.match(/^(\d+)m\s*(\d+)s$/);
  if (!m) return 0;
  return parseInt(m[1]) * 60 + parseInt(m[2]);
}

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const DEVICE_ICON: Record<string, string> = {
  Desktop: "🖥",
  Mobile: "📱",
  Tablet: "⬛",
};

type Props = {
  sessions: TableSession[];
  activeSessionId: string;
  onSessionClick?: (id: string) => void;
};

type SortIconProps = { col: SortKey; sortKey: SortKey; sortDir: SortDir };
function SortIcon({ col, sortKey, sortDir }: SortIconProps) {
  if (sortKey !== col) return <span className="ml-1 opacity-25">↕</span>;
  return <span className="ml-1 opacity-75">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

export default function SessionsTable({ sessions, activeSessionId, onSessionClick }: Props) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    let s = filterByTime(sessions, timeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      s = s.filter(
        (r) =>
          r.city.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }
    return sortSessions(s, sortKey, sortDir);
  }, [sessions, timeFilter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePageIndex = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePageIndex * PAGE_SIZE, (safePageIndex + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  const thCls =
    "px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.24em] text-ink-muted select-none cursor-pointer hover:text-ink transition-colors whitespace-nowrap";
  const tdCls = "px-4 py-3 text-sm text-ink-muted whitespace-nowrap";

  return (
    <div className="rounded-xl border border-cream-dark bg-surface">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-cream-dark px-4 py-3">
        <h3 className="mr-auto text-base font-semibold text-ink">All sessions</h3>

        {/* Time filter */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(TIME_LABELS) as TimeFilter[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                setTimeFilter(tf);
                setPage(0);
              }}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] transition ${
                timeFilter === tf
                  ? "border-forest bg-forest text-white"
                  : "border-cream-dark text-ink-muted hover:border-forest/50"
              }`}
            >
              {TIME_LABELS[tf]}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search city, country, source…"
          className="rounded-full border border-cream-dark bg-cream/30 px-3 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:border-forest focus:outline-none"
        />
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-cream-dark">
              <th className={thCls} onClick={() => handleSort("timestamp")}>
                Time <SortIcon col="timestamp" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={thCls} onClick={() => handleSort("country")}>
                Location <SortIcon col="country" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={thCls} onClick={() => handleSort("source")}>
                Source <SortIcon col="source" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={thCls}>Device</th>
              <th className={thCls} onClick={() => handleSort("pages")}>
                Pages <SortIcon col="pages" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={thCls} onClick={() => handleSort("duration")}>
                Duration <SortIcon col="duration" sortKey={sortKey} sortDir={sortDir} />
              </th>
              <th className={`${thCls} w-24`}>Session</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No sessions match the current filter.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const isActive = row.id === activeSessionId;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-cream-dark/50 transition-colors hover:bg-cream/20 ${
                      isActive ? "bg-forest/5" : ""
                    }`}
                  >
                    <td className={tdCls}>{fmtTime(row.timestamp)}</td>
                    <td className={tdCls}>
                      <span className="font-medium text-ink">{row.city}</span>
                      <span className="ml-1 text-ink-faint">{row.country}</span>
                    </td>
                    <td className={tdCls}>{row.source}</td>
                    <td className={tdCls}>
                      <span>{DEVICE_ICON[row.device] ?? "?"}</span>{" "}
                      <span>{row.device}</span>
                    </td>
                    <td className={tdCls}>{row.pages}</td>
                    <td className={tdCls}>{row.duration}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onSessionClick?.(row.id)}
                        className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] transition ${
                          isActive
                            ? "border-forest bg-forest text-white"
                            : "border-cream-dark text-ink-muted hover:border-forest/50 hover:text-forest"
                        }`}
                      >
                        {isActive ? "Viewing" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-cream-dark px-4 py-3 text-xs text-ink-muted">
          <span>
            Page {safePageIndex + 1} of {totalPages} ({filtered.length} sessions)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePageIndex === 0}
              className="rounded-full border border-cream-dark px-3 py-1 transition hover:border-forest disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePageIndex >= totalPages - 1}
              className="rounded-full border border-cream-dark px-3 py-1 transition hover:border-forest disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
