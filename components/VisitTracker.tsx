"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const STORAGE_KEY = "patl_sid";

function makeId(): string {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  const tag =
    typeof navigator !== "undefined" && /Mobi|Android/i.test(navigator.userAgent)
      ? "MO"
      : "WB";
  return `S-${tag}-${rand}`;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.sessionStorage.getItem(STORAGE_KEY);
    if (!id || !/^S-[A-Z0-9]{2,4}-[A-Za-z0-9]{4,16}$/.test(id)) {
      id = makeId();
      window.sessionStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return makeId();
  }
}

function labelForPath(p: string): string {
  if (p === "/" || p === "") return "Home";
  if (p.startsWith("/admin")) return "Admin";
  if (p.startsWith("/chapter/")) return `Chapter ${p.split("/")[2] ?? ""}`.trim();
  if (p.startsWith("/appendix/")) return `Appendix ${p.split("/")[2] ?? ""}`.trim();
  const seg = p.split("/").filter(Boolean)[0] ?? "Page";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) return;

    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const payload = JSON.stringify({
      sessionId,
      path: pathname,
      label: labelForPath(pathname),
    });

    function send(body: string, useBeacon: boolean) {
      try {
        if (
          useBeacon &&
          typeof navigator !== "undefined" &&
          typeof navigator.sendBeacon === "function"
        ) {
          const blob = new Blob([body], { type: "application/json" });
          if (navigator.sendBeacon("/api/track", blob)) return;
        }
      } catch {
        /* fall through to fetch */
      }
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => undefined);
    }

    // Initial page-view beacon for this route.
    send(payload, true);

    // Heartbeat every 30s while the tab is visible so dwell time is recorded
    // even when the visitor stays on a single page.
    const HEARTBEAT_MS = 30_000;
    let heartbeatId: ReturnType<typeof setInterval> | null = null;

    function startHeartbeat() {
      if (heartbeatId !== null) return;
      heartbeatId = setInterval(() => {
        if (typeof document !== "undefined" && document.visibilityState === "visible") {
          send(payload, false);
        }
      }, HEARTBEAT_MS);
    }
    function stopHeartbeat() {
      if (heartbeatId !== null) {
        clearInterval(heartbeatId);
        heartbeatId = null;
      }
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        send(payload, true);
        stopHeartbeat();
      } else if (document.visibilityState === "visible") {
        startHeartbeat();
      }
    }
    function onPageHide() {
      send(payload, true);
      stopHeartbeat();
    }

    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      startHeartbeat();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [pathname]);

  return null;
}
