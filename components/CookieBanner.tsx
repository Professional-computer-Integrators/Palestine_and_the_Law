"use client";

import { useEffect, useState } from "react";

const COOKIE_BANNER_KEY = "patl_cookie_consent_v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_BANNER_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage may be unavailable (SSR / privacy mode); show by default.
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(COOKIE_BANNER_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and data notice"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-gold/40 bg-forest-dark/95 text-cream shadow-2xl backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:gap-6 md:py-5">
        <div className="flex-1 text-sm leading-relaxed">
          <p className="font-serif text-base font-semibold text-cream">
            We collect minimal visitor data
          </p>
          <p className="mt-1 text-cream/80">
            To understand how readers use this site we record anonymous visit
            information: approximate location (city / country / region), browser
            and device type, the pages you view, the source you arrived from,
            and visit duration. We use a single local-storage entry to remember
            this notice. We do <strong>not</strong> set advertising cookies or
            share data with third parties.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center justify-end md:justify-start">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full bg-gold px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-dark transition hover:bg-gold-dark"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
