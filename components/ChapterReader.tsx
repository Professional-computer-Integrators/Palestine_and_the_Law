"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { parseDocument, type DocPage } from "@/lib/parseDoc";

interface Props {
  apiUrl: string;
  docUrl?: string;
  /** Page number printed on the FIRST page of this chapter in the source doc. */
  startPage?: number;
}

export default function ChapterReader({ apiUrl, docUrl, startPage = 1 }: Props) {
  const [pages, setPages] = useState<DocPage[]>([]);
  const [styles, setStyles] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Fetch + parse the doc ───────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(apiUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((html) => {
        if (cancelled) return;
        const parsed = parseDocument(html);
        setStyles(parsed.styles);
        setPages(parsed.pages);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  /* ── Internal anchor clicks (footnotes / cross-refs) ─────────── */
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const id = decodeURIComponent(href.slice(1));
    if (!id) return;
    const target =
      containerRef.current?.querySelector(`[id="${CSS.escape(id)}"]`) ??
      document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    (target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }, []);

  /* ── After load, honour any URL hash (e.g. #page-15) ─────────── */
  useEffect(() => {
    if (loading || !pages.length || typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("page-flash");
      setTimeout(() => el.classList.remove("page-flash"), 1600);
    });
  }, [loading, pages.length]);

  /* ── Search highlighting via ?q=... ──────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const sp = new URLSearchParams(window.location.search);
      setSearchQuery(sp.get("q") ?? "");
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const root = containerRef.current;
    // Strip previous highlights
    root.querySelectorAll("mark.search-hit").forEach((m) => {
      const parent = m.parentNode;
      if (!parent) return;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
    const q = searchQuery.trim();
    if (!q) return;
    const re = new RegExp(escapeRegex(q), "gi");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node: Node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest("mark, script, style, .chapter-toc")) return NodeFilter.FILTER_REJECT;
        return re.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    } as any);
    const targets: Text[] = [];
    let n: Node | null;
    while ((n = walker.nextNode())) targets.push(n as Text);
    for (const t of targets) {
      const text = t.nodeValue ?? "";
      const frag = document.createDocumentFragment();
      let last = 0;
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const mark = document.createElement("mark");
        mark.className = "search-hit";
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      t.parentNode?.replaceChild(frag, t);
    }
  }, [loading, pages, searchQuery]);

  const pageNav = useMemo(
    () =>
      pages.map((p) => {
        const displayed = p.docPageNumber + startPage - 1;
        return { displayed, anchor: `page-${displayed}` };
      }),
    [pages, startPage]
  );

  return (
    <div className="chapter-reader-wrap" ref={containerRef} onClick={handleClick}>
      <style>{`
        .chapter-reader-wrap { width: 100%; }
        .chapter-page-shell {
          background: #fff;
          color: #000;
          max-width: 8.5in;
          margin: 0 auto 28px;
          padding: 1in 1in 1.4in;
          box-shadow: 0 6px 24px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
          border-radius: 2px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12pt;
          line-height: 1.5;
          position: relative;
          scroll-margin-top: 90px;
          transition: box-shadow 0.4s ease;
        }
        .chapter-page-shell.page-flash {
          box-shadow: 0 0 0 3px rgb(var(--color-primary) / 0.6), 0 6px 24px rgba(0,0,0,0.10);
        }
        .chapter-page-marker {
          position: absolute;
          bottom: 0.45in;
          right: 0.7in;
          font-family: Georgia, serif;
          font-size: 10pt;
          color: #4b5563;
          letter-spacing: 0.04em;
        }
        .chapter-doc { word-wrap: break-word; }
        .chapter-doc p { margin: 0 0 6pt; }
        @media (max-width: 900px) {
          .chapter-page-shell { padding: 0.6in 0.5in 0.95in; }
        }
        @media (max-width: 640px) {
          .chapter-page-shell { padding: 24px 18px 60px; font-size: 11pt; }
          .chapter-page-marker { bottom: 14px; right: 14px; font-size: 10px; }
        }
        .chapter-toc {
          background: #fff;
          border: 1px solid rgba(58,100,145,0.18);
          border-radius: 6px;
          padding: 14px 18px;
          margin: 0 auto 24px;
          max-width: 8.5in;
          font-family: inherit;
          font-size: 13px;
          color: rgb(var(--color-primary));
        }
        .chapter-toc strong { font-weight: 600; margin-right: 8px; }
        .chapter-toc a {
          display: inline-block;
          margin: 2px 6px 2px 0;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(58,100,145,0.08);
          color: rgb(var(--color-primary));
          text-decoration: none;
          font-size: 12px;
        }
        .chapter-toc a:hover { background: rgba(58,100,145,0.18); }
      `}</style>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {loading && (
        <div style={{ padding: "60px 16px", textAlign: "center", color: "#6b7280" }}>
          <div
            style={{
              display: "inline-block",
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "3px solid rgba(58,100,145,0.25)",
              borderTopColor: "rgb(var(--color-primary))",
              animation: "chapterspin 0.8s linear infinite",
            }}
          />
          <p style={{ marginTop: 12, fontSize: 13 }}>Loading chapter…</p>
          <style>{`@keyframes chapterspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#dc2626", fontSize: 14 }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Failed to load chapter</p>
          <p style={{ color: "#6b7280", fontSize: 12 }}>{error}</p>
          {docUrl && (
            <p style={{ marginTop: 14 }}>
              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgb(var(--color-primary))", textDecoration: "underline" }}
              >
                Open in Google Docs
              </a>
            </p>
          )}
        </div>
      )}

      {!loading && !error && pages.length > 0 && (
        <>
          {pageNav.length > 1 && (
            <nav className="chapter-toc" aria-label="Jump to page">
              <strong>Pages:</strong>
              {pageNav.map((p) => (
                <a key={p.displayed} href={`#${p.anchor}`}>
                  {p.displayed}
                </a>
              ))}
            </nav>
          )}

          {pages.map((p) => {
            const displayed = p.docPageNumber + startPage - 1;
            return (
              <div
                key={p.docPageNumber}
                id={`page-${displayed}`}
                className="chapter-page-shell"
              >
                <div className="chapter-page-marker">Page {displayed}</div>
                <div className="chapter-doc" dangerouslySetInnerHTML={{ __html: p.html }} />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
