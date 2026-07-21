"use client";

import { useEffect, useMemo, useState } from "react";

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

function parseDurationParts(d: string): { minutes: number; seconds: number } {
  const match = d.match(/^(\d+)m\s*(\d+)s$/);
  if (!match) return { minutes: 0, seconds: 0 };

  const minutes = Number.parseInt(match[1], 10);
  const seconds = Number.parseInt(match[2], 10);

  return {
    minutes: Number.isFinite(minutes) && minutes >= 0 ? minutes : 0,
    seconds:
      Number.isFinite(seconds) && seconds >= 0
        ? Math.min(59, seconds)
        : 0,
  };
}

function formatDurationParts(minutes: number, seconds: number): string {
  const safeMinutes = Number.isFinite(minutes) && minutes >= 0 ? Math.floor(minutes) : 0;
  const safeSeconds = Number.isFinite(seconds) && seconds >= 0 ? Math.floor(seconds) : 0;
  return `${safeMinutes}m ${String(Math.min(59, safeSeconds)).padStart(2, "0")}s`;
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

const SECOND_OPTIONS = Array.from({ length: 60 }, (_, index) => index);

type Props = {
  sessions: TableSession[];
  activeSessionId: string;
  onSessionClick?: (id: string) => void;
  onDuplicateSession?: (id: string, count: number) => void | Promise<void>;
  onDeleteSession?: (id: string) => void | Promise<void>;
  onSaveSession?: (id: string, updates: Partial<TableSession>) => void | Promise<void>;
  onSaveSessionsBatch?: (
    updates: Array<{ id: string; session: Partial<TableSession> }>
  ) => void | Promise<void>;
  editingSessionId?: string;
  isMutatingSessionId?: string;
};

type SortIconProps = { col: SortKey; sortKey: SortKey; sortDir: SortDir };
function SortIcon({ col, sortKey, sortDir }: SortIconProps) {
  if (sortKey !== col) return <span className="ml-1 opacity-25">↕</span>;
  return <span className="ml-1 opacity-75">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

export default function SessionsTable({
  sessions,
  activeSessionId,
  onSessionClick,
  onDuplicateSession,
  onDeleteSession,
  onSaveSession,
  onSaveSessionsBatch,
  editingSessionId,
  isMutatingSessionId,
}: Props) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [isMasterEditMode, setIsMasterEditMode] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState<Partial<TableSession>>({});
  const [rowDrafts, setRowDrafts] = useState<Record<string, Partial<TableSession>>>({});
  const [duplicateCount, setDuplicateCount] = useState(1);
  const PAGE_SIZE = 10;
  const SHOW_STATS_EDIT_BUTTONS = false;

  function toInputDateTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function toIsoDateTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }

  function beginEditing(row: TableSession) {
    setEditingId(row.id);
    setDraft({ ...row });
  }

  function cancelEditing() {
    setEditingId("");
    setDraft({});
  }

  async function saveEditing() {
    if (!editingId || !onSaveSession) return;
    await onSaveSession(editingId, draft);
    cancelEditing();
  }

  function updateRowDraft(id: string, patch: Partial<TableSession>, row: TableSession) {
    setRowDrafts((prev) => {
      const base = prev[id] ?? { ...row };
      return {
        ...prev,
        [id]: { ...base, ...patch },
      };
    });
  }

  function resetRowDraft(id: string) {
    setRowDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function saveRowDraft(id: string, row: TableSession) {
    if (!onSaveSession) return;
    const payload = rowDrafts[id] ?? row;
    await onSaveSession(id, payload);
    resetRowDraft(id);
  }

  async function saveAllDraftRows() {
    const entries = Object.entries(rowDrafts);
    if (entries.length === 0) return;

    const payload = entries.map(([id, session]) => ({ id, session }));
    if (onSaveSessionsBatch) {
      await onSaveSessionsBatch(payload);
    } else if (onSaveSession) {
      for (const item of payload) {
        await onSaveSession(item.id, item.session);
      }
    }

    setRowDrafts({});
  }

  useEffect(() => {
    if (!editingSessionId) return;
    setIsMasterEditMode(false);
    const row = sessions.find((item) => item.id === editingSessionId);
    if (!row) return;
    beginEditing(row);
  }, [editingSessionId, sessions]);

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
  const pageRows = isMasterEditMode
    ? filtered
    : filtered.slice(safePageIndex * PAGE_SIZE, (safePageIndex + 1) * PAGE_SIZE);

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

        {SHOW_STATS_EDIT_BUTTONS && (
          <button
            type="button"
            onClick={() => {
              const next = !isMasterEditMode;
              setIsMasterEditMode(next);
              setEditingId("");
              setDraft({});
              if (!next) {
                setRowDrafts({});
              }
            }}
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] transition ${
              isMasterEditMode
                ? "border-forest bg-forest text-white"
                : "border-cream-dark text-ink-muted hover:border-forest/50"
            }`}
          >
            {isMasterEditMode ? "Exit master edit" : "Master edit"}
          </button>
        )}

        {SHOW_STATS_EDIT_BUTTONS && (
          <label className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
            Dup x
            <input
              type="number"
              min={1}
              max={200}
              value={duplicateCount}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isFinite(next)) return;
                setDuplicateCount(Math.max(1, Math.min(200, Math.floor(next))));
              }}
              className="w-16 rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
            />
          </label>
        )}

        {SHOW_STATS_EDIT_BUTTONS && isMasterEditMode && (
          <button
            type="button"
            onClick={() => void saveAllDraftRows()}
            disabled={Object.keys(rowDrafts).length === 0}
            className="rounded-full border border-forest bg-forest px-3 py-1 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save all changed rows ({Object.keys(rowDrafts).length})
          </button>
        )}

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
              <th className={`${thCls} w-72`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No sessions match the current filter.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const isActive = row.id === activeSessionId;
                const isEditing = isMasterEditMode || row.id === editingId;
                const isBusy = row.id === isMutatingSessionId;
                const rowDraft = rowDrafts[row.id] ?? row;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-cream-dark/50 transition-colors hover:bg-cream/20 ${
                      isActive ? "bg-forest/5" : ""
                    }`}
                  >
                    <td className={tdCls}>
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          value={toInputDateTime(
                            String(
                              isMasterEditMode
                                ? rowDraft.timestamp ?? row.timestamp
                                : draft.timestamp ?? row.timestamp
                            )
                          )}
                          onChange={(e) =>
                            isMasterEditMode
                              ? updateRowDraft(
                                  row.id,
                                  { timestamp: toIsoDateTime(e.target.value) },
                                  row
                                )
                              : setDraft((prev) => ({ ...prev, timestamp: toIsoDateTime(e.target.value) }))
                          }
                          className="w-44 rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                        />
                      ) : (
                        fmtTime(row.timestamp)
                      )}
                    </td>
                    <td className={tdCls}>
                      {isEditing ? (
                        <div className="grid gap-1">
                          <input
                            type="text"
                            value={String(
                              isMasterEditMode ? rowDraft.city ?? row.city : draft.city ?? row.city
                            )}
                            onChange={(e) =>
                              isMasterEditMode
                                ? updateRowDraft(row.id, { city: e.target.value }, row)
                                : setDraft((prev) => ({ ...prev, city: e.target.value }))
                            }
                            placeholder="City"
                            className="rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                          />
                          <input
                            type="text"
                            value={String(
                              isMasterEditMode ? rowDraft.country ?? row.country : draft.country ?? row.country
                            )}
                            onChange={(e) =>
                              isMasterEditMode
                                ? updateRowDraft(row.id, { country: e.target.value }, row)
                                : setDraft((prev) => ({ ...prev, country: e.target.value }))
                            }
                            placeholder="Country"
                            className="rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                          />
                          <input
                            type="text"
                            value={String(
                              isMasterEditMode ? rowDraft.region ?? row.region : draft.region ?? row.region
                            )}
                            onChange={(e) =>
                              isMasterEditMode
                                ? updateRowDraft(row.id, { region: e.target.value }, row)
                                : setDraft((prev) => ({ ...prev, region: e.target.value }))
                            }
                            placeholder="Region"
                            className="rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-ink">{row.city}</span>
                          <span className="ml-1 text-ink-faint">{row.country}</span>
                        </>
                      )}
                    </td>
                    <td className={tdCls}>
                      {isEditing ? (
                        <div className="grid gap-1">
                          <input
                            type="text"
                            value={String(
                              isMasterEditMode
                                ? rowDraft.source ?? row.source
                                : draft.source ?? row.source
                            )}
                            onChange={(e) =>
                              isMasterEditMode
                                ? updateRowDraft(row.id, { source: e.target.value }, row)
                                : setDraft((prev) => ({ ...prev, source: e.target.value }))
                            }
                            placeholder="Source"
                            className="rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                          />
                          <input
                            type="text"
                            value={String(
                              isMasterEditMode
                                ? rowDraft.browser ?? row.browser
                                : draft.browser ?? row.browser
                            )}
                            onChange={(e) =>
                              isMasterEditMode
                                ? updateRowDraft(row.id, { browser: e.target.value }, row)
                                : setDraft((prev) => ({ ...prev, browser: e.target.value }))
                            }
                            placeholder="Browser"
                            className="rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                          />
                        </div>
                      ) : (
                        row.source
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={String(
                            isMasterEditMode ? rowDraft.device ?? row.device : draft.device ?? row.device
                          )}
                          onChange={(e) =>
                            isMasterEditMode
                              ? updateRowDraft(row.id, { device: e.target.value }, row)
                              : setDraft((prev) => ({ ...prev, device: e.target.value }))
                          }
                          className="rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                        >
                          <option value="Desktop">Desktop</option>
                          <option value="Mobile">Mobile</option>
                          <option value="Tablet">Tablet</option>
                        </select>
                      ) : (
                        <>
                          <span>{DEVICE_ICON[row.device] ?? "?"}</span>{" "}
                          <span>{row.device}</span>
                        </>
                      )}
                    </td>
                    <td className={tdCls}>
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={String(
                            isMasterEditMode ? rowDraft.pages ?? row.pages : draft.pages ?? row.pages
                          )}
                          onChange={(e) =>
                            isMasterEditMode
                              ? updateRowDraft(row.id, { pages: Number(e.target.value) }, row)
                              : setDraft((prev) => ({ ...prev, pages: Number(e.target.value) }))
                          }
                          className="w-20 rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                        />
                      ) : (
                        row.pages
                      )}
                    </td>
                    <td className={tdCls}>
                      {isEditing ? (
                        (() => {
                          const durationText = String(
                            isMasterEditMode
                              ? rowDraft.duration ?? row.duration
                              : draft.duration ?? row.duration
                          );
                          const { minutes, seconds } = parseDurationParts(durationText);
                          const minuteOptions = Array.from(
                            { length: Math.max(180, minutes + 1) },
                            (_, index) => index
                          );

                          return (
                            <div className="flex items-center gap-1">
                              <select
                                value={String(minutes)}
                                onChange={(e) => {
                                  const nextMinutes = Number.parseInt(e.target.value, 10);
                                  const nextDuration = formatDurationParts(
                                    Number.isFinite(nextMinutes) ? nextMinutes : 0,
                                    seconds
                                  );
                                  if (isMasterEditMode) {
                                    updateRowDraft(row.id, { duration: nextDuration }, row);
                                  } else {
                                    setDraft((prev) => ({ ...prev, duration: nextDuration }));
                                  }
                                }}
                                className="w-20 rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                              >
                                {minuteOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <span className="text-xs text-ink-muted">m</span>
                              <select
                                value={String(seconds)}
                                onChange={(e) => {
                                  const nextSeconds = Number.parseInt(e.target.value, 10);
                                  const nextDuration = formatDurationParts(
                                    minutes,
                                    Number.isFinite(nextSeconds) ? nextSeconds : 0
                                  );
                                  if (isMasterEditMode) {
                                    updateRowDraft(row.id, { duration: nextDuration }, row);
                                  } else {
                                    setDraft((prev) => ({ ...prev, duration: nextDuration }));
                                  }
                                }}
                                className="w-16 rounded-md border border-cream-dark bg-cream/20 px-2 py-1 text-xs text-ink"
                              >
                                {SECOND_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {String(option).padStart(2, "0")}
                                  </option>
                                ))}
                              </select>
                              <span className="text-xs text-ink-muted">s</span>
                            </div>
                          );
                        })()
                      ) : (
                        row.duration
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onSessionClick?.(row.id)}
                          disabled={isBusy}
                          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] transition ${
                            isActive
                              ? "border-forest bg-forest text-white"
                              : "border-cream-dark text-ink-muted hover:border-forest/50 hover:text-forest"
                          } disabled:opacity-40`}
                        >
                          {isActive ? "Viewing" : "View"}
                        </button>

                        {SHOW_STATS_EDIT_BUTTONS && (isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                void (isMasterEditMode
                                  ? saveRowDraft(row.id, row)
                                  : saveEditing())
                              }
                              disabled={isBusy}
                              className="rounded-full border border-forest bg-forest px-3 py-1 text-xs uppercase tracking-[0.14em] text-white transition hover:bg-forest/90 disabled:opacity-40"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                isMasterEditMode ? resetRowDraft(row.id) : cancelEditing()
                              }
                              disabled={isBusy}
                              className="rounded-full border border-cream-dark px-3 py-1 text-xs uppercase tracking-[0.14em] text-ink-muted transition hover:border-forest/50 disabled:opacity-40"
                            >
                              {isMasterEditMode ? "Reset" : "Cancel"}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => beginEditing(row)}
                              disabled={isBusy}
                              className="rounded-full border border-cream-dark px-3 py-1 text-xs uppercase tracking-[0.14em] text-ink-muted transition hover:border-forest/50 hover:text-forest disabled:opacity-40"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDuplicateSession?.(row.id, duplicateCount)}
                              disabled={isBusy}
                              className="rounded-full border border-cream-dark px-3 py-1 text-xs uppercase tracking-[0.14em] text-ink-muted transition hover:border-forest/50 hover:text-forest disabled:opacity-40"
                            >
                              Duplicate x{duplicateCount}
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDeleteSession?.(row.id)}
                              disabled={isBusy}
                              className="rounded-full border border-red-300 px-3 py-1 text-xs uppercase tracking-[0.14em] text-red-700 transition hover:border-red-500 hover:text-red-800 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!isMasterEditMode && totalPages > 1 && (
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
