"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CHAPTERS } from "@/lib/chapters";

interface Props {
  /** Currently-open chapter number (so it can be highlighted). */
  activeNum: number;
}

export default function ChapterSidebar({ activeNum }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile toggle button (floats above content) ── */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden fixed bottom-4 left-4 z-40 rounded-full shadow-lg flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          background: "rgb(var(--color-primary))",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Toggle chapter list"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── The sidebar itself ── */}
      <aside
        className={`chapter-side ${mobileOpen ? "is-open" : ""}`}
        style={{
          width: collapsed ? 56 : 260,
        }}
      >
        <style>{`
          .chapter-side {
            position: sticky;
            top: var(--navbar-height, 0px);
            align-self: flex-start;
            height: calc(100vh - var(--navbar-height, 0px));
            max-height: calc(100vh - var(--navbar-height, 0px));
            background: #fff;
            border: none;
            border-right: 1px solid rgba(58,100,145,0.18);
            border-radius: 0;
            box-shadow: 2px 0 8px rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: width 0.2s ease;
            flex-shrink: 0;
          }
          @media (max-width: 1023px) {
            .chapter-side {
              position: fixed;
              top: 0;
              left: 0;
              bottom: 0;
              max-height: 100vh;
              border-radius: 0;
              z-index: 35;
              transform: translateX(-100%);
              transition: transform 0.25s ease;
              width: 280px !important;
            }
            .chapter-side.is-open { transform: translateX(0); }
          }
          .chapter-side header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            background: rgb(var(--color-primary));
            color: #fff;
            flex-shrink: 0;
          }
          .chapter-side header .title {
            font-family: Georgia, serif;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.04em;
          }
          .chapter-side .collapse-btn {
            background: rgba(255,255,255,0.15);
            border: none;
            color: #fff;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .chapter-side .collapse-btn:hover { background: rgba(255,255,255,0.28); }
          .chapter-side nav {
            overflow-y: auto;
            flex: 1;
            padding: 6px 0;
          }
          .chapter-side a {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            font-family: inherit;
            font-size: 12.5px;
            color: #1f2937;
            text-decoration: none;
            border-left: 3px solid transparent;
            transition: background 0.15s, border-color 0.15s;
          }
          .chapter-side a:hover { background: rgba(58,100,145,0.08); }
          .chapter-side a.active {
            background: rgba(58,100,145,0.12);
            border-left-color: rgb(var(--color-primary));
            font-weight: 600;
            color: rgb(var(--color-primary));
          }
          .chapter-side a .num {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            background: rgba(58,100,145,0.10);
            color: rgb(var(--color-primary));
            font-weight: 600;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .chapter-side a.active .num {
            background: rgb(var(--color-primary));
            color: #fff;
          }
          .chapter-side a .label {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .chapter-side.collapsed a .label,
          .chapter-side.collapsed .title,
          .chapter-side.collapsed footer { display: none; }
          .chapter-side footer {
            padding: 10px 12px;
            border-top: 1px solid rgba(0,0,0,0.06);
            font-size: 11px;
            color: #6b7280;
            flex-shrink: 0;
          }
          .chapter-side footer a {
            display: inline;
            padding: 0;
            border: none;
            font-size: 11px;
            color: rgb(var(--color-primary));
          }
        `}</style>

        <header>
          <span className="title">Chapters</span>
          <button
            className="collapse-btn hidden lg:flex"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "›" : "‹"}
          </button>
          <button
            className="collapse-btn lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <nav>
          {CHAPTERS.map((c) => {
            const href = `/chapter/${c.num}`;
            const isActive = c.num === activeNum && pathname === href;
            return (
              <Link
                key={c.num}
                href={href}
                className={isActive ? "active" : ""}
                title={`Chapter ${c.num} – ${c.title}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="num">{c.num}</span>
                <span className="label">{c.title}</span>
              </Link>
            );
          })}
        </nav>
        <footer>
          <Link href="/contents">← All chapters & appendices</Link>
        </footer>
      </aside>
    </>
  );
}
