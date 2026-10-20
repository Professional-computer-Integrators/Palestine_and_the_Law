import { NextRequest, NextResponse } from "next/server";
import { lookup } from "dns/promises";
import { isIP } from "net";
import { isAdminRequestAuthenticated } from "@/lib/admin/auth";

// Admin-only: given an article URL, return its preview image and site name
// (from Open Graph / Twitter meta tags) so an insight can show a thumbnail of
// where it came from.

const MAX_HTML_BYTES = 512 * 1024;

function isPrivateAddress(ip: string): boolean {
  if (ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  const v4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  if (isIP(v4) !== 4) return false;
  const [a, b] = v4.split(".").map(Number);
  return (
    a === 10 || a === 127 || a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function metaContent(html: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, "i"),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return m[1].replace(/&amp;/g, "&").trim();
    }
  }
  return undefined;
}

export async function GET(req: NextRequest) {
  if (!isAdminRequestAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let target: URL;
  try {
    target = new URL(req.nextUrl.searchParams.get("url") ?? "");
  } catch {
    return NextResponse.json({ error: "Enter a full link starting with https://" }, { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ error: "Only http(s) links are supported" }, { status: 400 });
  }

  // Don't let this endpoint be pointed at the server's own network.
  try {
    const { address } = await lookup(target.hostname);
    if (isPrivateAddress(address)) {
      return NextResponse.json({ error: "That address isn't allowed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Couldn't find that website" }, { status: 400 });
  }

  try {
    const res = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PalestineAndTheLaw/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    const html = (await res.text()).slice(0, MAX_HTML_BYTES);

    const rawImage = metaContent(html, ["og:image", "og:image:url", "twitter:image", "twitter:image:src"]);
    const thumbnail = rawImage ? new URL(rawImage, res.url).toString() : undefined;
    const source =
      metaContent(html, ["og:site_name", "application-name"]) ??
      new URL(res.url).hostname.replace(/^www\./, "");

    return NextResponse.json({ thumbnail, source });
  } catch {
    return NextResponse.json({ error: "Couldn't load that page" }, { status: 502 });
  }
}
