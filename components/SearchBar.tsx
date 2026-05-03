"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CHAPTERS, type ChapterMeta } from "@/lib/chapters";
import { parseDocument, htmlToPlainText } from "@/lib/parseDoc";

/** One page of one chapter, indexed for substring search. */
interface IndexedPage {
  chapter: ChapterMeta;
  /** Page number as displayed in the source document (after applying offset). */
  displayedPage: number;
  text: string;
  /** Lowercased version for fast indexOf scans. */
  lower: string;
}

interface SearchResult {
  chapter: ChapterMeta;
  displayedPage: number;
  /** HTML snippet with <mark> around the match. */
  snippet: string;
}

const SNIPPET_RADIUS = 80; // chars on each side of the match
const MAX_RESULTS = 30;

// Cache the index in module scope so it survives re-mounts of the component
// (e.g. route changes) within the same session.
let cachedIndex: IndexedPage[] | null = null;

export default function SearchBar({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [indexState, setIndexState] = useState<{
    loaded: number;
    total: number;
    ready: boolean;
    error: string | null;
  }>({
    loaded: cachedIndex ? CHAPTERS.length : 0,
    total: CHAPTERS.length,
    ready: !!cachedIndex,
    error: null,
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* ── Build index lazily on first interaction ─────────────────── */
  const buildIndex = useCallback(async () => {
    if (cachedIndex) return;
    setIndexState((s) => ({ ...s, loaded: 0, ready: false, error: null }));

    // 1. Get the computed start-page map (so search results show the same
    //    page numbers the reader displays).
    let offsets: Record<number, { startPage: number; pageCount: number }> = {};
    try {
      const res = await fetch("/api/chapter-offsets");
      if (res.ok) offsets = await res.json();
    } catch {
      // fall through; we'll default to startPage = 1 per chapter
    }

    const acc: IndexedPage[] = [];
    let loaded = 0;
    for (const ch of CHAPTERS) {
      const startPage = offsets[ch.num]?.startPage ?? 1;
      try {
        const res = await fetch(`/api/chapter?num=${ch.num}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const parsed = parseDocument(html);
        for (const p of parsed.pages) {
          const text = htmlToPlainText(p.html);
          acc.push({
            chapter: ch,
            displayedPage: p.docPageNumber + startPage - 1,
            text,
            lower: text.toLowerCase(),
          });
        }
      } catch (e) {
        console.warn(`Failed to index chapter ${ch.num}:`, e);
      }
      loaded++;
      setIndexState((s) => ({ ...s, loaded }));
    }
    cachedIndex = acc;
    setIndexState((s) => ({ ...s, ready: true }));
  }, []);

  useEffect(() => {
    if (!open) return;
    if (cachedIndex) return;
    buildIndex();
  }, [open, buildIndex]);

  /* ── Run search whenever query / index changes ──────────────── */
  useEffect(() => {
    const q = query.trim();
    if (!q || !cachedIndex) {
      setResults([]);
      return;
    }
    const lower = q.toLowerCase();
    const out: SearchResult[] = [];
    for (const page of cachedIndex) {
      const idx = page.lower.indexOf(lower);
      if (idx === -1) continue;
      const start = Math.max(0, idx - SNIPPET_RADIUS);
      const end = Math.min(page.text.length, idx + lower.length + SNIPPET_RADIUS);
      const before = (start > 0 ? "… " : "") + escapeHtml(page.text.slice(start, idx));
      const hit = `<mark>${escapeHtml(page.text.slice(idx, idx + lower.length))}</mark>`;
      const after = escapeHtml(page.text.slice(idx + lower.length, end)) + (end < page.text.length ? " …" : "");
      out.push({
        chapter: page.chapter,
        displayedPage: page.displayedPage,
        snippet: before + hit + after,
      });
      if (out.length >= MAX_RESULTS) break;
    }
    setResults(out);
  }, [query, indexState.ready]);

  /* ── Click outside to close ─────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* ── Handlers ────────────────────────────────────────────────── */
  const goToResult = (r: SearchResult) => {
    setOpen(false);
    const q = encodeURIComponent(query.trim());
    router.push(`/chapter/${r.chapter.num}?q=${q}#page-${r.displayedPage}`);
  };

  const inputId = `chapter-search-${variant}`;
  const isDesktop = variant === "desktop";

  return (
    <div
      ref={wrapRef}
      className={isDesktop ? "relative" : "relative w-full"}
      style={{ zIndex: 60 }}
    >
      <div
        className="flex items-center gap-2 rounded-md"
        style={{
          background: isDesktop ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          padding: "4px 10px",
          minWidth: isDesktop ? 220 : "auto",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: "rgba(255,255,255,0.6)" }}>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
        </svg>
        <input
          id={inputId}
          type="text"
          placeholder="Search the book…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent outline-none text-cream placeholder:text-cream/40"
          style={{ fontSize: 13, padding: "4px 0", minWidth: 0 }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            aria-label="Clear search"
            className="text-cream/50 hover:text-cream"
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div
          className="absolute mt-1 rounded-md shadow-2xl border"
          style={{
            top: "100%",
            right: isDesktop ? 0 : undefined,
            left: isDesktop ? undefined : 0,
            width: isDesktop ? 420 : "100%",
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "70vh",
            overflowY: "auto",
            background: "#fff",
            color: "#1f2937",
            borderColor: "rgba(0,0,0,0.12)",
          }}
        >
          {/* Status / loading */}
          {!indexState.ready && (
            <div style={{ padding: "12px 14px", fontSize: 12, color: "#6b7280" }}>
              Indexing chapters… {indexState.loaded}/{indexState.total}
              <div
                style={{
                  marginTop: 6,
                  height: 3,
                  background: "rgba(58,100,145,0.12)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(indexState.loaded / indexState.total) * 100}%`,
                    height: "100%",
                    background: "rgb(var(--color-primary))",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          )}

          {indexState.ready && !query.trim() && (
            <div style={{ padding: "14px 14px", fontSize: 12, color: "#6b7280" }}>
              Type any word or phrase to search across all 19 chapters. Results show
              the chapter, page number, and a preview.
            </div>
          )}

          {indexState.ready && query.trim() && results.length === 0 && (
            <div style={{ padding: "14px 14px", fontSize: 13, color: "#6b7280" }}>
              No matches found for <strong>“{query.trim()}”</strong>.
            </div>
          )}

          {results.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 4 }}>
              {results.map((r, i) => (
                <li key={`${r.chapter.num}-${r.displayedPage}-${i}`}>
                  <button
                    onClick={() => goToResult(r)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      padding: "10px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(58,100,145,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "rgb(var(--color-primary))",
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      Chapter {r.chapter.num} · Page {r.displayedPage}
                    </div>
                    <div style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>
                      {r.chapter.title}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.4 }}
                      dangerouslySetInnerHTML={{ __html: r.snippet }}
                    />
                  </button>
                </li>
              ))}
              {results.length >= MAX_RESULTS && (
                <li style={{ padding: "8px 12px", fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
                  Showing first {MAX_RESULTS} matches — refine your query for more.
                </li>
              )}
            </ul>
          )}

          <style>{`
            mark { background: #ffe26a; padding: 0 2px; border-radius: 2px; color: inherit; }
          `}</style>
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
