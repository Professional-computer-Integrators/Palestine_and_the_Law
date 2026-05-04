import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  getAdminAuthCookieValue,
  isAdminAuthConfigured,
} from "@/lib/admin/auth";

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

function isAuthenticated(request: NextRequest): boolean {
  const cookieValue = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  return Boolean(cookieValue) && cookieValue === getAdminAuthCookieValue();
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loginPath = "/admin/login";
  const authApiPath = "/api/admin/auth";
  const isAdminRoute = pathname.startsWith("/admin");
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

  // Check admin is configured before allowing any admin route
  if ((isAdminRoute || isAdminApiRoute) && !isAdminAuthConfigured()) {
    if (pathname.startsWith("/api/")) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Admin security is not configured." }, { status: 503 })
      );
    }
    return withSecurityHeaders(
      NextResponse.redirect(new URL("/", request.url))
    );
  }

  if (isAdminRoute || isAdminApiRoute) {
    const authenticated = isAuthenticated(request);

    // Always allow the auth endpoint itself
    if (pathname === authApiPath) {
      return withSecurityHeaders(NextResponse.next());
    }

    // Allow access to the login page; redirect away if already authed
    if (pathname === loginPath) {
      if (authenticated) {
        return withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
      }
      return withSecurityHeaders(NextResponse.next());
    }

    // Protect all other admin routes
    if (!authenticated) {
      if (pathname.startsWith("/api/admin/")) {
        return withSecurityHeaders(
          NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        );
      }
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
