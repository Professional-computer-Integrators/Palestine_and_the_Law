"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

/* ─── types ──────────────────────────────────────────────────────── */
interface DocPage {
  /** 1-based page number as it appears in the original document */
  docPageNumber: number;
  /** The HTML content of this page (with Google's inline styles preserved) */
  html: string;
}

/* ─── helpers ────────────────────────────────────────────────────── */

/**
 * Parse the published Google Doc HTML into CSS styles + per-page content.
 *
 * Key behaviours:
 *  • Splits pages on the <hr style="page-break-before:always"> Docs inserts.
 *  • Detects Google's footnote section (after <hr class="c21">).
 *  • Moves each footnote to the page that contains its in-text reference,
 *    so clicking a footnote number scrolls within the current page.
 */
function parseDocument(html: string): { styles: string; pages: DocPage[] } {
  // ── Extract <style> blocks ──────────────────────────────────────
  let styles = "";
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm;
  while ((sm = styleRe.exec(html)) !== null) styles += sm[1];
  styles += `
    body, html { background: transparent !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
    .doc-content { padding: 0 !important; }
    sup a, .c7 a { color: #1a5cb8; text-decoration: none; cursor: pointer; }
    sup a:hover, .c7 a:hover { text-decoration: underline; }
    hr.c21, hr[class="c21"] { width: 33%; height: 0; border: none; border-top: 1px solid #000; margin: 12pt 0 4pt; }
  `;

  // ── DOM parse ───────────────────────────────────────────────────
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root: Element = doc.querySelector(".doc-content") ?? doc.body;

  // ── Pull footnote definitions out of the DOM ────────────────────
  // Google Docs appends all footnotes after <hr class="c21"> at the
  // bottom of the document.  We remove them here and re-inject each
  // one into the page that contains its reference anchor.
  const fnSep = root.querySelector("hr.c21");
  const footnotes: Array<{ id: string; html: string }> = [];
  if (fnSep) {
    let n: Node | null = fnSep.nextSibling;
    while (n) {
      if (n.nodeType === Node.ELEMENT_NODE) {
        const anchor = (n as Element).querySelector("[id^='ftnt']");
        if (anchor) footnotes.push({ id: anchor.id, html: (n as Element).outerHTML });
      }
      n = n.nextSibling;
    }
    // Remove separator and everything after it
    let rem: Node | null = fnSep;
    while (rem) {
      const next: Node | null = rem.nextSibling;
      rem.parentNode?.removeChild(rem);
      rem = next;
    }
  }

  // ── Locate page-break <hr> elements ────────────────────────────
  const pbHrs = Array.from(root.querySelectorAll<HTMLHRElement>("hr[style]")).filter(
    (hr) => /page-break/i.test(hr.getAttribute("style") ?? "")
  );

  const nodesToHtml = (start: Node | null, end: Node | null): string => {
    const parts: string[] = [];
    let n = start;
    while (n && n !== end) {
      parts.push(
        n.nodeType === Node.ELEMENT_NODE
          ? (n as Element).outerHTML
          : (n.textContent ?? "")
      );
      n = n.nextSibling;
    }
    return parts.join("");
  };

  // ── Build page chunks ───────────────────────────────────────────
  const rawParts: string[] = [];
  let cursor: Node | null = root.firstChild;
  for (const hr of pbHrs) {
    rawParts.push(nodesToHtml(cursor, hr));
    cursor = hr.nextSibling;
  }
  rawParts.push(nodesToHtml(cursor, null));

  let pages: DocPage[] = rawParts
    .map((h, i) => ({ docPageNumber: i + 1, html: h }))
    .filter((p) => p.html.trim().length > 20);

  if (pages.length === 0) {
    return { styles, pages: [{ docPageNumber: 1, html: root.innerHTML }] };
  }

  // ── Redistribute footnotes onto their reference pages ───────────
  // In-text ref: <a href="#ftnt1" id="ftnt_ref1">
  // Footnote def: <a href="#ftnt_ref1" id="ftnt1">
  for (const fn of footnotes) {
    const refId = fn.id.replace(/^ftnt(\d+)$/, "ftnt_ref$1");
    const idx = pages.findIndex((p) => p.html.includes(`id="${refId}"`));
    const target = idx !== -1 ? idx : pages.length - 1;
    const hasSep = pages[target].html.includes('class="c21"');
    pages[target] = {
      ...pages[target],
      html: pages[target].html + (hasSep ? "" : '<hr class="c21">') + fn.html,
    };
  }

  return { styles, pages };
}

/* ─── Individual page component ─────────────────────────────────── */

/**
 * Split a page's HTML into [bodyHtml, footnoteHtml].
 * The footnote section starts at the footnote-rule <hr class="c21">.
 */
function splitPageFootnotes(html: string): [string, string] {
  const match = html.match(/<hr[^>]*class="[^"]*c21[^"]*"[^>]*>/i);
  if (!match || match.index === undefined) return [html, ""];
  return [html.slice(0, match.index), html.slice(match.index + match[0].length)];
}

function DocPageView({
  page,
  styles,
}: {
  page: DocPage;
  styles: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const [bodyHtml, footnoteHtml] = splitPageFootnotes(page.html);

  /* Reset scroll to top whenever the page changes */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [page]);

  /* Intercept in-page anchor clicks (#ftntN / #ftnt_refN) */
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href?.startsWith("#")) return;
    e.preventDefault();
    const id = href.slice(1);
    const el = containerRef.current?.querySelector(`[id="${id}"]`);
    if (!el || !scrollRef.current) return;
    const scrollTop =
      (el as HTMLElement).offsetTop -
      (scrollRef.current as HTMLElement).offsetTop -
      12;
    scrollRef.current.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
  }, []);

  const doScroll = useCallback((dir: "up" | "down") => {
    scrollRef.current?.scrollBy({ top: dir === "down" ? 200 : -200, behavior: "smooth" });
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        position: "relative",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "12pt",
        lineHeight: "1.5",
        color: "#000",
      }}
    >
      {/* Google Doc styles */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ── Scrollable body — fills available height ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "scroll",  /* always show scrollbar track so layout is stable */
          padding: "72px 80px 24px",
          boxSizing: "border-box",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </div>

      {/* ── Footnotes — pinned to page bottom ── */}
      {footnoteHtml && (
        <div
          style={{
            flexShrink: 0,
            padding: "8px 80px 32px",
            background: "#fff",
          }}
        >
          {/* 33 % rule matching Google's .c21 <hr> */}
          <div style={{ width: "33%", height: 0, borderTop: "1px solid #000", marginBottom: "6px" }} />
          <div
            style={{ fontSize: "10pt", lineHeight: "1.4" }}
            dangerouslySetInnerHTML={{ __html: footnoteHtml }}
          />
        </div>
      )}

    </div>
  );
}

/* ─── Page transition wrapper ───────────────────────────────────── */
/* Uses opacity + translateX fade-slide instead of 3D rotateY.
   3D CSS transforms break overflow-scroll in all major browsers when
   the scrollable element is a descendant of the transformed node.   */

type FlipDir = "next" | "prev" | "none";

function FlipContainer({
  pageIndex,
  children,
  direction,
}: {
  pageIndex: number;
  children: React.ReactNode;
  direction: FlipDir;
}) {
  const [displayIndex, setDisplayIndex]     = useState(pageIndex);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [visible, setVisible]               = useState(true);
  const pendingRef = useRef<{ index: number; children: React.ReactNode } | null>(null);

  useEffect(() => {
    if (pageIndex === displayIndex) return;
    pendingRef.current = { index: pageIndex, children };

    // Fade out
    setVisible(false);

    const t = setTimeout(() => {
      if (pendingRef.current) {
        setDisplayIndex(pendingRef.current.index);
        setDisplayChildren(pendingRef.current.children);
      }
      setVisible(true);
    }, 180);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  const slideX = direction === "next" ? 24 : -24;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : `translateX(${slideX}px)`,
        transition: "opacity 180ms ease, transform 180ms ease",
        willChange: "opacity, transform",
      }}
    >
      {displayChildren}
    </div>
  );
}


/* ─── Main BookReader component ─────────────────────────────────── */
export function BookReader({
  title,
  apiUrl,
  onClose,
}: {
  title: string;
  apiUrl: string;
  onClose: () => void;
}) {
  const [pages, setPages] = useState<DocPage[]>([]);
  const [styles, setStyles] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0); // 0-based
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipDir, setFlipDir] = useState<FlipDir>("none");
  const [mounted, setMounted] = useState(false);

  /* fetch + parse */
  useEffect(() => {
    setMounted(true);
    // Lock scrolling behind the overlay by injecting a style rule onto <html>
    // Using a class is more reliable than inline styles across browsers
    const styleEl = document.createElement("style");
    styleEl.textContent = "html, body { overflow: hidden !important; }";
    document.head.appendChild(styleEl);

    fetch(apiUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((html) => {
        const { styles, pages } = parseDocument(html);
        setStyles(styles);
        setPages(pages);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });

    return () => {
      document.head.removeChild(styleEl);
    };
  }, [apiUrl]);

  /* keyboard nav */
  const goNext = useCallback(() => {
    setCurrentIndex((i) => {
      if (i >= pages.length - 1) return i;
      setFlipDir("next");
      return i + 1;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => {
      if (i <= 0) return i;
      setFlipDir("prev");
      return i - 1;
    });
  }, []);

  useEffect(() => {
    // Prevent arrow keys from scrolling the background page
    const handler = (e: KeyboardEvent) => {
      if (["ArrowRight","ArrowLeft","ArrowDown","ArrowUp"," "].includes(e.key)) e.preventDefault();
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [onClose, goNext, goPrev]);

  if (!mounted) return null;

  const currentPage = pages[currentIndex];
  const totalPages = pages.length;
  const docPageNum = currentPage?.docPageNumber ?? currentIndex + 1;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(6,14,28,0.88)",
        backdropFilter: "blur(10px)",
        overscrollBehavior: "none",
        touchAction: "none",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onWheel={(e) => e.preventDefault()}
    >
      {/* ── Animated particle dots ── */}
      <style>{`
        @keyframes particle-rise {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-110vh) scale(0.4); opacity: 0; }
        }
        @keyframes particle-drift {
          0%, 100% { margin-left: 0; }
          50%       { margin-left: 30px; }
        }
        .br-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: particle-rise linear infinite, particle-drift ease-in-out infinite;
        }
      `}</style>
      {/* 24 floating dots scattered across the overlay */}
      {[
        { l:"5%",  s:4,  dur:9,  delay:0,   ddur:4,  c:"rgba(85,133,180,0.5)" },
        { l:"10%", s:6,  dur:12, delay:2,   ddur:5,  c:"rgba(224,176,96,0.4)" },
        { l:"18%", s:3,  dur:8,  delay:5,   ddur:3,  c:"rgba(85,133,180,0.35)" },
        { l:"25%", s:5,  dur:14, delay:1,   ddur:6,  c:"rgba(255,255,255,0.15)" },
        { l:"33%", s:7,  dur:10, delay:3.5, ddur:5,  c:"rgba(85,133,180,0.4)" },
        { l:"42%", s:3,  dur:11, delay:0.5, ddur:4,  c:"rgba(224,176,96,0.3)" },
        { l:"50%", s:5,  dur:13, delay:4,   ddur:6,  c:"rgba(255,255,255,0.12)" },
        { l:"58%", s:4,  dur:9,  delay:1.5, ddur:3,  c:"rgba(85,133,180,0.45)" },
        { l:"65%", s:8,  dur:15, delay:6,   ddur:7,  c:"rgba(224,176,96,0.25)" },
        { l:"72%", s:3,  dur:10, delay:2.5, ddur:4,  c:"rgba(85,133,180,0.3)" },
        { l:"80%", s:6,  dur:12, delay:0,   ddur:5,  c:"rgba(255,255,255,0.1)" },
        { l:"88%", s:4,  dur:8,  delay:3,   ddur:3,  c:"rgba(85,133,180,0.5)" },
        { l:"93%", s:5,  dur:11, delay:1,   ddur:6,  c:"rgba(224,176,96,0.35)" },
        { l:"3%",  s:3,  dur:16, delay:7,   ddur:8,  c:"rgba(255,255,255,0.08)" },
        { l:"15%", s:7,  dur:13, delay:4.5, ddur:5,  c:"rgba(85,133,180,0.3)" },
        { l:"28%", s:4,  dur:9,  delay:2,   ddur:4,  c:"rgba(224,176,96,0.4)" },
        { l:"38%", s:5,  dur:14, delay:5.5, ddur:6,  c:"rgba(85,133,180,0.35)" },
        { l:"48%", s:3,  dur:10, delay:0.5, ddur:3,  c:"rgba(255,255,255,0.15)" },
        { l:"55%", s:6,  dur:12, delay:3,   ddur:5,  c:"rgba(85,133,180,0.5)" },
        { l:"63%", s:4,  dur:8,  delay:1.5, ddur:4,  c:"rgba(224,176,96,0.3)" },
        { l:"75%", s:8,  dur:15, delay:6.5, ddur:7,  c:"rgba(255,255,255,0.1)" },
        { l:"82%", s:3,  dur:11, delay:2,   ddur:4,  c:"rgba(85,133,180,0.4)" },
        { l:"90%", s:5,  dur:9,  delay:4,   ddur:3,  c:"rgba(224,176,96,0.35)" },
        { l:"97%", s:4,  dur:13, delay:0,   ddur:5,  c:"rgba(85,133,180,0.45)" },
      ].map((p, i) => (
        <span
          key={i}
          className="br-particle"
          style={{
            left: p.l,
            bottom: "-10px",
            width: p.s,
            height: p.s,
            background: p.c,
            animationDuration: `${p.dur}s, ${p.ddur}s`,
            animationDelay: `${p.delay}s, ${p.delay}s`,
          }}
        />
      ))}

      {/* ── Book shell ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "820px",
          height: "92dvh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "10px",
          overflow: "hidden",
          background: "#f4f8fc",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.65), -6px 0 0 0 rgb(var(--color-primary-dark)), 6px 0 20px rgba(0,0,0,0.3)",
          border: "1px solid rgba(58,100,145,0.2)",
        }}
      >
        {/* Left spine */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "10px",
            zIndex: 10,
            background:
              "linear-gradient(180deg, rgb(var(--color-primary-dark)), rgb(var(--color-primary)), rgb(var(--color-primary-dark)))",
            boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
          }}
        />

        {/* ── Header ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: "24px",
            paddingRight: "12px",
            paddingTop: "10px",
            paddingBottom: "10px",
            background: "rgb(var(--color-primary))",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, flexShrink: 0, color: "rgba(255,255,255,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "inherit", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "rgba(255,255,255,0.5)", margin: 0 }}>Palestine and the Law</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <a href="https://docs.google.com/document/d/e/2PACX-1vQFZZPPadgq_hkxCF_UM1wNVgAf0c8GfF346h_wUnmgU3D6noIRI9mZ62j8EPsjqwAY5BSK6LHFbA6L/pub" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", fontSize: 11, padding: "5px 10px", borderRadius: 5, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", textDecoration: "none", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 11, height: 11 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Open in Docs
            </a>
            <button onClick={onClose}
              style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, border: "none", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.55)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              title="Close (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Gold accent */}
        <div style={{ height: 3, flexShrink: 0, background: "linear-gradient(90deg,#000000,#000000,#000000,#000000,#000000)" }} />

        {/* ── Page area ── */}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative", paddingLeft: "10px", paddingRight: "10px", paddingTop: "10px", paddingBottom: "10px", background: "#e8eef4" }}>
          {loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#f4f8fc" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgb(var(--color-primary-light))", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontFamily: "inherit", fontSize: 13, color: "rgba(58,100,145,0.6)" }}>Loading document…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "#f4f8fc", padding: 32, textAlign: "center" }}>
              <p style={{ fontFamily: "inherit", fontSize: 14, color: "#dc2626", fontWeight: 600 }}>Failed to load document</p>
              <p style={{ fontFamily: "inherit", fontSize: 12, color: "#6b7280" }}>{error}</p>
            </div>
          )}

          {!loading && !error && currentPage && (
            <FlipContainer pageIndex={currentIndex} direction={flipDir}>
              <DocPageView page={currentPage} styles={styles} />
            </FlipContainer>
          )}
        </div>

        {/* ── Footer navigation ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: "24px",
            paddingRight: "16px",
            paddingTop: "8px",
            paddingBottom: "8px",
            background: "#f0f5fa",
            borderTop: "1px solid rgba(58,100,145,0.12)",
          }}
        >
          {/* Prev */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0 || loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid",
              cursor: currentIndex === 0 || loading ? "not-allowed" : "pointer",
              opacity: currentIndex === 0 || loading ? 0.35 : 1,
              background: "transparent",
              borderColor: "rgba(58,100,145,0.3)",
              color: "rgb(var(--color-primary))",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (currentIndex > 0 && !loading) e.currentTarget.style.background = "rgba(58,100,145,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            title="Previous page (← Arrow)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>

          {/* Page indicator */}
          <div style={{ textAlign: "center" }}>
            {!loading && totalPages > 0 && (
              <>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 600, color: "rgb(var(--color-primary))", margin: 0, lineHeight: 1.2 }}>
                  Page {docPageNum}
                </p>
                <p style={{ fontFamily: "inherit", fontSize: 10, color: "rgba(58,100,145,0.5)", margin: 0, marginTop: 1 }}>
                  {currentIndex + 1} of {totalPages} • Use ← → keys to navigate
                </p>
              </>
            )}
            {loading && (
              <p style={{ fontFamily: "inherit", fontSize: 11, color: "rgba(58,100,145,0.4)", margin: 0 }}>Loading…</p>
            )}
          </div>

          {/* Next */}
          <button
            onClick={goNext}
            disabled={currentIndex >= totalPages - 1 || loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid",
              cursor: currentIndex >= totalPages - 1 || loading ? "not-allowed" : "pointer",
              opacity: currentIndex >= totalPages - 1 || loading ? 0.35 : 1,
              background: "rgb(var(--color-primary))",
              borderColor: "rgb(var(--color-primary))",
              color: "#fff",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (currentIndex < totalPages - 1 && !loading) e.currentTarget.style.background = "rgb(var(--color-primary-light))"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgb(var(--color-primary))"; }}
            title="Next page (→ Arrow)"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
