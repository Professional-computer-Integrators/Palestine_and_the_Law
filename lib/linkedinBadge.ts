// The floating "Follow on LinkedIn" badge. Used by both the server (settings.json)
// and the browser, so this file must not import anything server-only.

export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/reynoldscarmen";

/** x/y are 0–100: 0 = flush with the left/top edge, 100 = flush with the
 *  right/bottom edge, so the badge always stays fully on screen. scale is a %. */
export interface LinkedinBadgePlacement {
  x: number;
  y: number;
  scale: number;
}

export const LINKEDIN_BADGE_SCALE_MIN = 60;
export const LINKEDIN_BADGE_SCALE_MAX = 200;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Returns a valid placement, or null if the value isn't one. */
export function sanitiseLinkedinBadge(value: unknown): LinkedinBadgePlacement | null {
  if (!value || typeof value !== "object") return null;
  const { x, y, scale } = value as Record<string, unknown>;
  if (![x, y, scale].every((n) => typeof n === "number" && Number.isFinite(n))) return null;
  return {
    x: clamp(x as number, 0, 100),
    y: clamp(y as number, 0, 100),
    scale: clamp(scale as number, LINKEDIN_BADGE_SCALE_MIN, LINKEDIN_BADGE_SCALE_MAX),
  };
}

/** Public pages the admin can hide the badge on. A group covers every page under its path. */
export const LINKEDIN_BADGE_PAGES = [
  { key: "home", label: "Home", path: "/", group: false },
  { key: "contents", label: "Overview of Chapters", path: "/contents", group: false },
  { key: "chapters", label: "Chapters (all)", path: "/chapter", group: true },
  { key: "appendices", label: "Appendices (all)", path: "/appendix", group: true },
  { key: "dedication", label: "Dedication & Acknowledgements", path: "/dedication", group: false },
  { key: "insights", label: "Insights", path: "/insights", group: false },
  { key: "updates", label: "Updates", path: "/updates", group: false },
  { key: "contact", label: "Contact", path: "/contact", group: false },
] as const;

export type LinkedinBadgePageKey = (typeof LINKEDIN_BADGE_PAGES)[number]["key"];

const PAGE_KEYS = new Set<string>(LINKEDIN_BADGE_PAGES.map((p) => p.key));

/** Keeps only known page keys, without duplicates. Anything else becomes []. */
export function sanitiseLinkedinBadgeHiddenOn(value: unknown): LinkedinBadgePageKey[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((k): k is LinkedinBadgePageKey => typeof k === "string" && PAGE_KEYS.has(k)))];
}

/** The page key for a pathname, or null for pages not in the list (always shown). */
export function linkedinBadgePageKey(pathname: string): LinkedinBadgePageKey | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  for (const page of LINKEDIN_BADGE_PAGES) {
    if (path === page.path || (page.group && path.startsWith(page.path + "/"))) return page.key;
  }
  return null;
}

/** "float" = fixed on screen (the default); "footer" = part of the site footer instead. */
export type LinkedinBadgeMode = "float" | "footer";

export function sanitiseLinkedinBadgeMode(value: unknown): LinkedinBadgeMode {
  return value === "footer" ? "footer" : "float";
}

export type LinkedinBadgeFooterAlign = "left" | "center" | "right";

/** Alignment and size of the badge when it sits in the footer; null = centred at 100%. */
export interface LinkedinBadgeFooterPlacement {
  align: LinkedinBadgeFooterAlign;
  scale: number;
}

export function sanitiseLinkedinBadgeFooter(value: unknown): LinkedinBadgeFooterPlacement | null {
  if (!value || typeof value !== "object") return null;
  const { align, scale } = value as Record<string, unknown>;
  if (align !== "left" && align !== "center" && align !== "right") return null;
  if (typeof scale !== "number" || !Number.isFinite(scale)) return null;
  return { align, scale: clamp(scale, LINKEDIN_BADGE_SCALE_MIN, LINKEDIN_BADGE_SCALE_MAX) };
}
