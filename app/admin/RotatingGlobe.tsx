"use client";

import {
  useRef,
  useEffect,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from "react";
import * as d3Geo from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Rotation speed — degrees per millisecond
const DEG_PER_MS = 0.006;

export type GlobeSession = {
  id: string;
  city: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
};

type Props = {
  sessions: GlobeSession[];
  activeSessionId: string;
  onSessionClick: (id: string) => void;
};

type GeoFeature = GeoJSON.Feature<GeoJSON.Geometry>;

// ── colour palette ─────────────────────────────────────────────────────────
const OCEAN = "#0d1f2d";
const LAND = "#1a3a2f";
const BORDER = "#2d6a4f";
const GRATICULE_C = "rgba(45,106,79,0.15)";
const HALO = "rgba(45,106,79,0.20)";
const DOT_IDLE = "#40916c";
const DOT_ACTIVE = "#52b788";
const GLOW_IDLE = "rgba(64,145,108,0.45)";
const GLOW_ACTIVE = "rgba(82,183,136,0.85)";

export default function RotatingGlobe({ sessions, activeSessionId, onSessionClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // mutable refs so RAF closure always sees latest values
  const rotationRef = useRef<[number, number, number]>([0, -20, 0]);
  const pausedRef = useRef(false);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const landRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const activeIdRef = useRef(activeSessionId);
  const sessionsRef = useRef(sessions);
  const sizeRef = useRef({ w: 600, h: 600 });
  const pulseRef = useRef(0);

  // keep refs in sync
  useEffect(() => { activeIdRef.current = activeSessionId; }, [activeSessionId]);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  // ── load topology once ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((topo: Topology) => {
        const countries = topo.objects["countries"] as GeometryCollection;
        landRef.current = feature(topo, countries) as GeoJSON.FeatureCollection;
      })
      .catch(() => {/* silently ignore fetch errors */});
  }, []);

  // ── resize observer ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const h = Math.round(width * 0.72);
        sizeRef.current = { w: Math.round(width), h };
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = Math.round(width) * devicePixelRatio;
          canvas.height = h * devicePixelRatio;
          canvas.style.width = `${Math.round(width)}px`;
          canvas.style.height = `${h}px`;
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── main draw + RAF loop ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw(ts: number) {
      if (!canvas) return;
      if (!pausedRef.current) {
        const dt = lastTsRef.current === null ? 0 : ts - lastTsRef.current;
        rotationRef.current = [
          rotationRef.current[0] + DEG_PER_MS * dt,
          rotationRef.current[1],
          rotationRef.current[2],
        ];
        pulseRef.current = (pulseRef.current + dt * 0.0012) % 1;
      }
      lastTsRef.current = ts;

      const { w, h } = sizeRef.current;
      const dpr = devicePixelRatio;
      const radius = Math.min(w, h) * 0.44;
      const cx = w / 2;
      const cy = h / 2;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const proj = d3Geo.geoOrthographic()
        .scale(radius)
        .translate([cx, cy])
        .rotate(rotationRef.current)
        .clipAngle(90);

      const path = d3Geo.geoPath(proj, ctx);
      const graticule = d3Geo.geoGraticule()();

      // Ocean disc
      ctx.beginPath();
      path({ type: "Sphere" });
      const oceanGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.25, radius * 0.05, cx, cy, radius);
      oceanGrad.addColorStop(0, "#0d2030");
      oceanGrad.addColorStop(1, OCEAN);
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Atmosphere glow
      const atmo = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.12);
      atmo.addColorStop(0, HALO);
      atmo.addColorStop(1, "rgba(45,106,79,0)");
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = atmo;
      ctx.fill();

      // Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = GRATICULE_C;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Land
      if (landRef.current) {
        ctx.beginPath();
        landRef.current.features.forEach((f: GeoFeature) => path(f));
        const landGrad = ctx.createRadialGradient(cx - radius * 0.15, cy - radius * 0.2, 0, cx, cy, radius);
        landGrad.addColorStop(0, "#2d6a4f");
        landGrad.addColorStop(1, LAND);
        ctx.fillStyle = landGrad;
        ctx.fill();

        ctx.beginPath();
        landRef.current.features.forEach((f: GeoFeature) => path(f));
        ctx.strokeStyle = BORDER;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Sphere edge
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = "rgba(45,106,79,0.30)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Visitor dots
      const pulseFactor = Math.sin(pulseRef.current * Math.PI * 2) * 0.5 + 0.5;

      for (const session of sessionsRef.current) {
        const projected = proj(session.coordinates);
        if (!projected) continue;

        const [px, py] = projected;
        const isActive = session.id === activeIdRef.current;

        const dotR = isActive ? 7 : 5;
        const pulseR = dotR + (isActive ? 14 : 10) * pulseFactor;
        const pulseAlpha = isActive
          ? (1 - pulseFactor) * 0.6
          : (1 - pulseFactor) * 0.35;

        // Pulse ring
        ctx.beginPath();
        ctx.arc(px, py, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = isActive
          ? `rgba(82,183,136,${pulseAlpha})`
          : `rgba(64,145,108,${pulseAlpha * 0.7})`;
        ctx.fill();

        // Shadow under dot
        ctx.beginPath();
        ctx.arc(px, py, dotR + 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fill();

        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, dotR * 3.5);
        glow.addColorStop(0, isActive ? GLOW_ACTIVE : GLOW_IDLE);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(px, py, dotR * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Dot body
        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? DOT_ACTIVE : DOT_IDLE;
        ctx.fill();

        // Dot highlight
        ctx.beginPath();
        ctx.arc(px - dotR * 0.28, py - dotR * 0.28, dotR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── click handling ───────────────────────────────────────────────────────
  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const { w, h } = sizeRef.current;
      const radius = Math.min(w, h) * 0.44;

      const proj = d3Geo.geoOrthographic()
        .scale(radius)
        .translate([w / 2, h / 2])
        .rotate(rotationRef.current)
        .clipAngle(90);

      for (const session of sessionsRef.current) {
        const pt = proj(session.coordinates);
        if (!pt) continue;
        const [px, py] = pt;
        const hitR = (session.id === activeIdRef.current ? 7 : 5) + 8;
        if (Math.hypot(mx - px, my - py) < hitR) {
          onSessionClick(session.id);
          return;
        }
      }
    },
    [onSessionClick]
  );

  // ── pause-on-hover so dots are easy to click ─────────────────────────────
  const handleMouseEnter = useCallback(() => {
    pausedRef.current = true;
    lastTsRef.current = null;
  }, []);
  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false;
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-2xl border border-cream-dark bg-[#0a1a14]"
      style={{ minHeight: 300 }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="block w-full cursor-pointer"
        aria-label="Rotating globe showing visitor session locations"
        role="img"
      />

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#52b788]" />
          Active session
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#40916c]" />
          Session
        </span>
        <span className="opacity-60">Hover to pause · Click to select</span>
      </div>
    </div>
  );
}
