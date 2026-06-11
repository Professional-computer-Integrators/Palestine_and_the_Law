// IP-based geolocation. Calls ip-api.com (free tier: 45 req/min, no key)
// only when the request is not from a private/loopback range, and caches
// results in-process for 24h to stay well under the limit.

import { lookupCountry } from "./geo";

export type IpLocation = {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  coordinates: [number, number];
  isPrivate: boolean;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { value: IpLocation; expires: number }>();

export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return true;
  if (ip === "unknown") return true;
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) return true;
  if (/^f[cd][0-9a-f]{2}:/i.test(ip)) return true;
  return false;
}

function privateLocation(ip: string): IpLocation {
  return {
    ip,
    country: "Local",
    countryCode: "",
    region: "Local",
    city: "Local network",
    coordinates: [0, 0],
    isPrivate: true,
  };
}

export async function lookupIpLocation(ipRaw: string): Promise<IpLocation> {
  const ip = (ipRaw || "").trim();
  if (isPrivateIp(ip)) return privateLocation(ip || "local");

  const now = Date.now();
  const cached = cache.get(ip);
  if (cached && cached.expires > now) return cached.value;

  try {
    const url = `http://ip-api.com/json/${encodeURIComponent(
      ip
    )}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,query`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`ip-api ${res.status}`);
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      city?: string;
      lat?: number;
      lon?: number;
    };

    if (data.status !== "success") throw new Error("ip-api lookup failed");

    const fallback = lookupCountry(data.countryCode);
    const value: IpLocation = {
      ip,
      country: data.country || fallback.name,
      countryCode: data.countryCode || "",
      region: fallback.region,
      city: data.city || fallback.name,
      coordinates:
        typeof data.lon === "number" && typeof data.lat === "number"
          ? [data.lon, data.lat]
          : fallback.coords,
      isPrivate: false,
    };
    cache.set(ip, { value, expires: now + CACHE_TTL_MS });
    return value;
  } catch {
    const value: IpLocation = {
      ip,
      country: "Unknown",
      countryCode: "",
      region: "Unknown",
      city: "Unknown",
      coordinates: [0, 0],
      isPrivate: false,
    };
    cache.set(ip, { value, expires: now + 5 * 60 * 1000 });
    return value;
  }
}
