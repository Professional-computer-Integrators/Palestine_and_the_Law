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
