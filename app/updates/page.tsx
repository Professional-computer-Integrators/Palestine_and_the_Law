"use client";

import { useTheme } from "@/contexts/ThemeContext";
import ScrollReveal from "@/components/ScrollReveal";

export default function UpdatesPage() {
  const { updates } = useTheme();

  return (
    <>
      {/* Page header */}
      <section className="bg-forest py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Palestine and the Law
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-4">
            Updates
          </h1>
          <div className="gold-divider mx-auto" />
          <p className="font-sans text-base text-cream/60 mt-6 max-w-xl mx-auto leading-relaxed">
            Latest news, announcements, and updates from the team.
          </p>
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

      {/* Updates list */}
      <section className="py-20 bg-parchment">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {updates.length === 0 ? (
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
                No Updates Yet
              </h2>
              <p className="font-sans text-sm text-ink-muted">
                Check back soon for news and announcements.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update, idx) => (
                <ScrollReveal key={update.id} direction="up" delay={idx < 4 ? idx * 80 : 0}>
                <article
                  className="bg-surface border border-cream-dark rounded-sm shadow-sm overflow-hidden"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
                  <div className="px-8 py-7">
                    {/* Date badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-block bg-forest/10 text-forest font-sans text-xs font-semibold px-3 py-1 rounded-sm tracking-wide">
                        {new Date(update.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="font-sans text-xs text-ink-faint">
                        Update #{updates.length - idx}
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl font-bold text-forest mb-3 leading-snug">
                      {update.title}
                    </h2>

                    <div className="gold-divider" />

                    <p className="font-sans text-base text-ink-muted leading-relaxed mt-4 whitespace-pre-wrap">
                      {update.content}
                    </p>
                  </div>
                </article>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
