import { NextResponse, type NextRequest } from "next/server";

type RateBucket = {
  count: number;
  resetAt: number;
};

const RATE_STORE = globalThis as typeof globalThis & {
  __adminRateStore?: Map<string, RateBucket>;
};

const rateStore = RATE_STORE.__adminRateStore ?? new Map<string, RateBucket>();
RATE_STORE.__adminRateStore = rateStore;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  return firstForwarded ?? "unknown";
}

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateStore.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (bucket.count >= limit) {
    return true;
  }

  bucket.count += 1;
  return false;
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

function isAuthenticated(_request: NextRequest): boolean {
  // Admin gating is handled client-side via ThemeContext / useTheme().isAdmin
  // on the page itself. Middleware only enforces rate limits + security headers
  // for the admin API surface.
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authApiPath = "/api/admin/auth";
  const isAdminApiRoute = pathname.startsWith("/api/admin/");

  const ip = clientIp(request);

  // Rate-limit auth attempts
  if (pathname === authApiPath && request.method === "POST") {
    if (isRateLimited(`auth:${ip}`, 8, 5 * 60 * 1000)) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Too many attempts" }, { status: 429 })
      );
    }
  }

  // Rate-limit other admin API calls
  if (
    isAdminApiRoute &&
    pathname !== authApiPath &&
    isRateLimited(`admin-api:${ip}`, 120, 60 * 1000)
  ) {
    return withSecurityHeaders(
      NextResponse.json({ error: "Too many requests" }, { status: 429 })
    );
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
