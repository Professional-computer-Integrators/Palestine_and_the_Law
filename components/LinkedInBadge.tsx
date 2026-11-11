"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LINKEDIN_PROFILE_URL,
  LINKEDIN_BADGE_SCALE_MAX,
  LINKEDIN_BADGE_SCALE_MIN,
  linkedinBadgePageKey,
  type LinkedinBadgePlacement,
} from "@/lib/linkedinBadge";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const CONTROL_STYLE: React.CSSProperties = {
  fontFamily: "inherit", fontSize: 11, lineHeight: 1, padding: "5px 9px",
  borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap",
  background: "#1b3556", color: "#deeaf6", border: "1px solid rgba(255,255,255,0.2)",
};

/** Converts the badge's top-left corner (px) into a placement that keeps it on screen. */
function toPlacement(left: number, top: number, width: number, height: number, scale: number): LinkedinBadgePlacement {
  const freeX = document.documentElement.clientWidth - width;
  const freeY = document.documentElement.clientHeight - height;
  return {
    x: freeX > 0 ? clamp((left / freeX) * 100, 0, 100) : 0,
    y: freeY > 0 ? clamp((top / freeY) * 100, 0, 100) : 0,
    scale,
  };
}

type Gesture = {
  kind: "move" | "resize";
  pointerX: number;
  pointerY: number;
  rect: DOMRect;
  scale: number;
};

const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: "1.55em", height: "1.55em", flexShrink: 0 }}>
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <path
      fill="#fff"
      d="M7.1 9.6h-2.6v8.4h2.6V9.6zM5.8 5.4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM19.5 13.4c0-2.3-.5-4-3.2-4-1.3 0-2.2.7-2.5 1.4h-.04V9.6h-2.5v8.4h2.6v-4.2c0-1.1.2-2.2 1.6-2.2 1.4 0 1.4 1.3 1.4 2.3V18h2.6v-4.6z"
    />
  </svg>
);

/**
 * Floating "Follow on LinkedIn" badge shown on every public page. In edit mode
 * the admin can drag it anywhere and resize it from the corner handle; the
 * placement is saved to the shared settings so every visitor sees it there.
 */
export default function LinkedInBadge() {
  const pathname = usePathname();
  const {
    isAdmin, editMode,
    linkedinBadge, setLinkedinBadge,
    linkedinBadgeHiddenOn, setLinkedinBadgeHiddenOn,
  } = useTheme();
  const badgeRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  // Live placement while dragging/resizing; saved once the pointer is released.
  const [draft, setDraft] = useState<LinkedinBadgePlacement | null>(null);

  if (pathname?.startsWith("/admin")) return null;

  const editing = isAdmin && editMode;
  const pageKey = linkedinBadgePageKey(pathname ?? "/");
  const hiddenHere = pageKey !== null && linkedinBadgeHiddenOn.includes(pageKey);
  // Visitors don't see it; in edit mode the admin sees it faded so it can be switched back on.
  if (hiddenHere && !editing) return null;

  const placement = draft ?? linkedinBadge;
  const scale = placement?.scale ?? 100;

  const startGesture = (kind: Gesture["kind"]) => (e: React.PointerEvent) => {
    if (!editing || !badgeRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = {
      kind,
      pointerX: e.clientX,
      pointerY: e.clientY,
      rect: badgeRef.current.getBoundingClientRect(),
      scale,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.pointerX;
    const dy = e.clientY - g.pointerY;
    if (g.kind === "move") {
      setDraft(toPlacement(g.rect.left + dx, g.rect.top + dy, g.rect.width, g.rect.height, g.scale));
    } else {
      // Grow from the top-left corner, following the handle horizontally.
      const next = clamp(
        Math.round((g.scale * (g.rect.width + dx)) / g.rect.width),
        LINKEDIN_BADGE_SCALE_MIN,
        LINKEDIN_BADGE_SCALE_MAX
      );
      const ratio = next / g.scale;
      setDraft(toPlacement(g.rect.left, g.rect.top, g.rect.width * ratio, g.rect.height * ratio, next));
    }
  };

  const endGesture = () => {
    if (!gesture.current) return;
    gesture.current = null;
    if (draft) setLinkedinBadge(draft);
    setDraft(null);
  };

  const positionStyle: React.CSSProperties = placement
    ? {
        left: `${placement.x}%`,
        top: `${placement.y}%`,
        transform: `translate(-${placement.x}%, -${placement.y}%)`,
      }
    : {
        left: 16,
        // Chapter and appendix pages have a contents button in this corner on small screens.
        bottom: /^\/(chapter|appendix)/.test(pathname ?? "") ? 76 : 16,
      };

  return (
    <div
      ref={badgeRef}
      onPointerDown={startGesture("move")}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
      className="print:hidden fixed z-[90]"
      style={{
        ...positionStyle,
        cursor: editing ? "move" : undefined,
        touchAction: editing ? "none" : undefined,
        outline: editing ? "2px dashed rgba(85,133,180,0.9)" : undefined,
        outlineOffset: 3,
        borderRadius: 999,
      }}
    >
      <a
        href={LINKEDIN_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Carmen Reynolds on LinkedIn"
        title={editing ? "Drag to move · drag the corner to resize" : "Follow Carmen Reynolds on LinkedIn"}
        onClick={(e) => {
          if (editing) e.preventDefault();
        }}
        draggable={false}
        className="inline-flex select-none items-center rounded-full border border-cream-dark/70 bg-surface/95 text-ink shadow-lg backdrop-blur transition-colors hover:border-[#0A66C2] hover:bg-white"
        style={{
          fontSize: `${(13 * scale) / 100}px`,
          gap: "0.55em",
          padding: "0.4em 0.95em 0.4em 0.45em",
          cursor: editing ? "move" : "pointer",
          opacity: hiddenHere ? 0.45 : undefined,
        }}
      >
        <LinkedInLogo />
        <span className="whitespace-nowrap font-sans font-semibold tracking-wide">Follow on LinkedIn</span>
      </a>

      {editing && (
        <>
          <span
            role="presentation"
            onPointerDown={startGesture("resize")}
            title="Drag to resize"
            style={{
              position: "absolute", right: -9, bottom: -9, width: 18, height: 18,
              borderRadius: 4, background: "#5585b4", border: "2px solid #fff",
              cursor: "nwse-resize", touchAction: "none",
            }}
          />
          <div
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: "absolute", left: 0, display: "flex", gap: 6,
              // Keep the controls on screen: above the badge, or below it when it's near the top.
              ...(placement && placement.y < 50 ? { top: "calc(100% + 10px)" } : { bottom: "calc(100% + 8px)" }),
            }}
          >
            {pageKey && (
              <button
                type="button"
                onClick={() =>
                  setLinkedinBadgeHiddenOn(
                    hiddenHere
                      ? linkedinBadgeHiddenOn.filter((k) => k !== pageKey)
                      : [...linkedinBadgeHiddenOn, pageKey]
                  )
                }
                title={hiddenHere ? "Visitors can't see the badge on this page" : "Stop showing the badge on this page"}
                style={{
                  ...CONTROL_STYLE,
                  ...(hiddenHere ? { background: "#7a2e2e", borderColor: "rgba(255,255,255,0.35)" } : {}),
                }}
              >
                {hiddenHere ? "Hidden on this page — click to show" : "Hide on this page"}
              </button>
            )}
            {linkedinBadge && (
              <button
                type="button"
                onClick={() => setLinkedinBadge(null)}
                title="Put the badge back in its original corner at its original size"
                style={CONTROL_STYLE}
              >
                Reset position &amp; size
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
