/**
 * Server-side helper that fetches every published appendix, counts how many
 * pages each one has, and returns a map of `appendixNum → startPage` such
 * that page numbers run continuously through all appendices.
 *
 * Anchor: Appendix I begins at page 296 (matches the printed book).
 * Appendix N+1 begins at appendix N's startPage + appendix N's pageCount.
 *
 * Results are cached in module scope for 5 minutes so we don't refetch on
 * every request.
 */
import { APPENDICES } from "./appendices";

const ANCHOR_START = 296; // page number printed on the first page of Appendix I
const TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  /** map: appendixNum -> { startPage, pageCount } */
  data: Record<number, { startPage: number; pageCount: number }>;
  expiresAt: number;
}

let cached: CacheEntry | null = null;
let inflight: Promise<CacheEntry["data"]> | null = null;

const PAGE_BREAK_RE = /<hr\b[^>]*style=["'][^"']*page-break[^"']*["'][^>]*>/gi;
const FOOTNOTE_HR_RE = /<hr\b[^>]*class=["'][^"']*\bc21\b[^"']*["'][^>]*>[\s\S]*$/i;

/**
 * Count the number of physical pages in a Google-Docs `/pub` HTML response.
 * Mirrors the splitting/filtering done client-side in parseDocument().
 */
function countPages(html: string): number {
  const trimmed = html.replace(FOOTNOTE_HR_RE, "");
  const parts = trimmed.split(PAGE_BREAK_RE);
  const valid = parts.filter((p) => p.trim().length > 20);
  return Math.max(1, valid.length);
}

async function buildOffsets(): Promise<CacheEntry["data"]> {
  const counts = await Promise.all(
    APPENDICES.map(async (a) => {
      try {
        const res = await fetch(a.docUrl, {
          cache: "no-store",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; PalestineAndTheLaw/1.0)",
          },
        });
        if (!res.ok) return 1;
        const html = await res.text();
        return countPages(html);
      } catch {
        return 1;
      }
    })
  );

  const data: CacheEntry["data"] = {};
  let cursor = ANCHOR_START;
  for (let i = 0; i < APPENDICES.length; i++) {
    data[APPENDICES[i].num] = { startPage: cursor, pageCount: counts[i] };
    cursor += counts[i];
  }
  return data;
}

export async function getAppendixOffsets(): Promise<CacheEntry["data"]> {
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  if (inflight) return inflight;
  inflight = buildOffsets()
    .then((data) => {
      cached = { data, expiresAt: Date.now() + TTL_MS };
      return data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export async function getAppendixStartPage(num: number): Promise<number> {
  const offsets = await getAppendixOffsets();
  return offsets[num]?.startPage ?? ANCHOR_START;
}
