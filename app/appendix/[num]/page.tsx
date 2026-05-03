import { notFound } from "next/navigation";
import Link from "next/link";
import ChapterReader from "@/components/ChapterReader";
import AppendixSidebar from "@/components/AppendixSidebar";
import { APPENDICES, getAppendix } from "@/lib/appendices";
import { getAppendixStartPage } from "@/lib/appendixOffsets";

export function generateStaticParams() {
  return APPENDICES.map((a) => ({ num: String(a.num) }));
}

export default async function AppendixPage({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { num } = await params;
  const app = getAppendix(num);
  if (!app) notFound();

  const startPage = await getAppendixStartPage(app.num);

  const prev = APPENDICES.find((a) => a.num === app.num - 1);
  const next = APPENDICES.find((a) => a.num === app.num + 1);

  return (
    <section className="relative min-h-screen">
      <div className="flex items-start gap-0">
        <AppendixSidebar activeNum={app.num} />
        <div className="flex-1 min-w-0 px-3 sm:px-6 lg:px-10 py-8">
          <div className="mb-2">
            <Link
              href="/contents"
              className="font-sans text-xs text-ink-muted hover:text-forest transition-colors"
            >
              ← Overview of Chapters
            </Link>
          </div>
          <div
            className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1"
            style={{ scrollMarginTop: "calc(var(--navbar-height, 90px) + 16px)" }}
          >
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-forest">
              Appendix {app.roman} – {app.title}
            </h1>
            <a
              href={app.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-ink-muted hover:text-forest transition-colors"
            >
              Open in Google Docs ↗
            </a>
          </div>

          <ChapterReader
            apiUrl={`/api/appendix?num=${app.num}`}
            docUrl={app.docUrl}
            startPage={startPage}
          />

          {/* Prev / next nav cards — always two equal-width slots */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-cream-dark pt-8">
            {prev ? (
              <Link
                href={`/appendix/${prev.num}`}
                className="card p-5 group hover:border-gold/40 hover:shadow-md transition-all duration-200 no-underline text-inherit"
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-9 h-9 rounded-sm bg-gold/20 border border-gold/30 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-colors duration-200">
                    <span className="font-serif text-sm font-bold text-forest">←</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-ink-muted mb-1">
                      Previous · Appendix {prev.roman}
                    </p>
                    <p className="font-serif text-sm font-semibold text-forest leading-tight truncate">
                      {prev.title}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
            {next ? (
              <Link
                href={`/appendix/${next.num}`}
                className="card p-5 group hover:border-gold/40 hover:shadow-md transition-all duration-200 no-underline text-inherit"
              >
                <div className="flex items-center gap-3 sm:flex-row-reverse sm:text-right">
                  <span className="flex-shrink-0 w-9 h-9 rounded-sm bg-gold/20 border border-gold/30 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-colors duration-200">
                    <span className="font-serif text-sm font-bold text-forest">→</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-ink-muted mb-1">
                      Next · Appendix {next.roman}
                    </p>
                    <p className="font-serif text-sm font-semibold text-forest leading-tight truncate">
                      {next.title}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
