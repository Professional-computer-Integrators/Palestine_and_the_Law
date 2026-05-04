"use client";

import { FormEvent, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function normalizeNextPath(raw: string | null): string {
  if (!raw) return "/admin";
  if (!raw.startsWith("/")) return "/admin";
  if (raw.startsWith("//")) return "/admin";
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = useMemo(
    () => normalizeNextPath(searchParams.get("next")),
    [searchParams]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Incorrect password.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Could not verify password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          className="block text-xs font-medium uppercase tracking-[0.18em] text-ink-muted"
          htmlFor="admin-password"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-2 w-full rounded-lg border border-cream-dark bg-parchment px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-forest focus:outline-none"
          placeholder="Enter admin password"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-3 pt-1">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.16em] text-ink-muted hover:text-ink"
        >
          Back to site
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-forest px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Unlock admin"}
        </button>
      </div>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-6 py-10 text-ink">
      <section className="w-full max-w-md rounded-2xl border border-cream-dark bg-surface p-8 shadow-lg">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-ink-muted">
          Admin access
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-ink md:text-5xl">
          Enter password
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-ink-muted">
          This area is protected. Enter the admin password to access the statistics dashboard.
        </p>
        <Suspense fallback={<div className="mt-7 h-32 animate-pulse rounded-lg bg-cream/40" />}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
