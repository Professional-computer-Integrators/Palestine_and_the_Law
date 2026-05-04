import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  getAdminAuthCookieValue,
  isAdminAuthConfigured,
  isValidAdminPassword,
} from "@/lib/admin/auth";
import {
  isIpLockedOut,
  recordFailedAttempt,
  clearFailureRecord,
} from "@/lib/admin/failban";

export const runtime = "nodejs";

type AuthPayload = {
  password?: string;
};

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  return firstForwarded ?? "unknown";
}

export async function GET(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ isAdmin: false });
  }

  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_AUTH_COOKIE}=([^;]*)`));
  const cookieValue = match?.[1] ?? "";

  const isAdmin = cookieValue === getAdminAuthCookieValue() && Boolean(getAdminAuthCookieValue());
  return NextResponse.json({ isAdmin });
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ ok: false, error: "Admin auth is not configured." }, { status: 500 });
  }

  const isLocked = await isIpLockedOut(ip);
  if (isLocked) {
    return NextResponse.json(
      { ok: false, error: "Too many failed attempts. Please try again later." },
      { status: 429 }
    );
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && !origin.includes(host)) {
    return NextResponse.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  let payload: AuthPayload = {};
  try {
    payload = (await request.json()) as AuthPayload;
  } catch {
    payload = {};
  }

  const password = payload.password ?? "";

  if (!isValidAdminPassword(password)) {
    await recordFailedAttempt(ip);
    return NextResponse.json({ ok: false, error: "Invalid password." }, { status: 401 });
  }

  await clearFailureRecord(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: getAdminAuthCookieValue(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}

export async function DELETE() {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ ok: false, error: "Admin auth is not configured." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
