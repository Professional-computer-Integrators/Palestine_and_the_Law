"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme, type SiteUpdate } from "@/contexts/ThemeContext";
import ScrollReveal from "@/components/ScrollReveal";
import EditableText from "@/components/EditableText";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Hostname of a link without "www.", for showing where an insight came from. */
function hostOf(url?: string) {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/** Thumbnail with a branded fallback, so every card keeps the same shape. */
function InsightThumbnail({ insight, className }: { insight: SiteUpdate; className: string }) {
  const [failed, setFailed] = useState(false);
  const label = insight.source || hostOf(insight.sourceUrl);

  if (insight.thumbnail && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={insight.thumbnail}
        alt={label ? `From ${label}` : ""}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${className} w-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} w-full flex items-center justify-center bg-gradient-to-br from-forest-dark via-forest to-forest-light`}
    >
      <span className="font-serif text-4xl font-bold text-cream/80">
        {(label || insight.title).charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function SourceBadge({ insight }: { insight: SiteUpdate }) {
  const label = insight.source || hostOf(insight.sourceUrl);
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 font-sans text-xs text-ink-muted truncate">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
      <span className="truncate">{label}</span>
    </span>
  );
}

function InsightModal({ insight, onClose }: { insight: SiteUpdate; onClose: () => void }) {
  // Close on Escape and stop the page behind from scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="insight-modal-title"
    >
      <article
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <InsightThumbnail insight={insight} className="h-56 sm:h-72" />
        <div className="h-1 w-full bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

        <div className="px-6 sm:px-8 py-7">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-block bg-forest/10 text-forest font-sans text-xs font-semibold px-3 py-1 rounded-sm tracking-wide">
              {formatDate(insight.date)}
            </span>
            <SourceBadge insight={insight} />
          </div>

          <h2 id="insight-modal-title" className="font-serif text-2xl md:text-3xl font-bold text-forest-dark mb-3 leading-snug">
            {insight.title}
          </h2>
          <div className="gold-divider" />
          <p className="font-sans text-base text-ink leading-relaxed mt-4 whitespace-pre-wrap">
            {insight.content}
          </p>

          {insight.sourceUrl && (
            <a
              href={insight.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-forest hover:text-forest-dark underline underline-offset-4"
            >
              Read the original{insight.source ? ` on ${insight.source}` : ""} ↗
            </a>
          )}
        </div>
      </article>
    </div>
  );
}

export default function InsightsPage() {
  // Insights are stored under `updates` in shared settings — same data, new label.
  const { updates: insights } = useTheme();
  const [openId, setOpenId] = useState<string | null>(null);
  const openInsight = insights.find((i) => i.id === openId) ?? null;
  const closeInsight = useCallback(() => setOpenId(null), []);

  return (
    <>
      {/* Page header */}
      <section className="py-20 relative overflow-hidden">

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Palestine and the Law
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-4">
            Insights
          </h1>
          <div className="gold-divider mx-auto" />
          <EditableText
            id="insights.header.subtitle"
            defaultText="Reflections, commentary, and analysis on the legal questions surrounding the Arab-Israel conflict."
            tag="p"
            className="font-sans text-base text-cream/60 mt-6 max-w-xl mx-auto leading-relaxed"
            label="Insights — page subtitle"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 40L1440 40L1440 0C1440 0 1200 30 720 20C240 10 0 0 0 0L0 40Z"
              fill="#f4f8fc"
            />
          </svg>
        </div>
      </section>

      {/* Insights grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {insights.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-forest/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-forest mb-2">
                No Insights Yet
              </h2>
              <p className="font-sans text-sm text-ink-muted">
                Check back soon for new commentary and analysis.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {insights.map((insight, idx) => (
                <ScrollReveal
                  key={insight.id}
                  direction="up"
                  delay={idx < 6 ? idx * 80 : 0}
                  className="h-full"
                >
                  {/* Fixed-height card: thumbnail, clamped title + excerpt, "Read more"
                      pinned to the bottom so every card in the grid matches. */}
                  <button
                    type="button"
                    onClick={() => setOpenId(insight.id)}
                    className="group h-[27rem] w-full flex flex-col text-left bg-surface border border-cream-dark rounded-sm shadow-sm overflow-hidden
                      transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-gold/50
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <div className="relative overflow-hidden flex-shrink-0">
                      <div className="transition-transform duration-500 group-hover:scale-105">
                        <InsightThumbnail insight={insight} className="h-44" />
                      </div>
                    </div>
                    <div className="h-1 w-full flex-shrink-0 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

                    <div className="flex flex-1 flex-col min-h-0 px-6 py-5">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="inline-block bg-forest/10 text-forest font-sans text-xs font-semibold px-2.5 py-1 rounded-sm tracking-wide whitespace-nowrap">
                          {formatDate(insight.date)}
                        </span>
                        <SourceBadge insight={insight} />
                      </div>

                      <h2 className="font-serif text-xl font-bold text-forest-dark leading-snug line-clamp-2">
                        {insight.title}
                      </h2>

                      <p className="font-sans text-sm text-ink-muted leading-relaxed mt-2 line-clamp-3">
                        {insight.content}
                      </p>

                      <span className="mt-auto pt-3 inline-flex items-center gap-1 font-sans text-sm font-semibold text-forest">
                        Read more
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {openInsight && <InsightModal insight={openInsight} onClose={closeInsight} />}
    </>
  );
}
