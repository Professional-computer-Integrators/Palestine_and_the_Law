import { notFound } from "next/navigation";
import ChapterReader from "@/components/ChapterReader";
import ChapterSidebar from "@/components/ChapterSidebar";
import { CHAPTERS, getChapter } from "@/lib/chapters";
import { getChapterStartPage } from "@/lib/pageOffsets";

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ num: String(c.num) }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { num } = await params;
  const ch = getChapter(num);
  if (!ch) notFound();

  // Compute the page number this chapter starts on by counting the pages of
  // every preceding chapter. Anchor: Chapter 1 = page 11.
  const startPage = await getChapterStartPage(ch.num);

  return (
    <section className="relative min-h-screen">
      {/* Far-left chapter sidebar + the document, side by side. The site
          navbar (rendered by app/layout) stays sticky at the top. */}
      <div className="flex items-start gap-0">
        <ChapterSidebar activeNum={ch.num} />
        <div className="flex-1 min-w-0 px-3 sm:px-6 lg:px-10 py-8">
          <div
            className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1"
            style={{ scrollMarginTop: "calc(var(--navbar-height, 90px) + 16px)" }}
          >
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-forest">
              Chapter {ch.num} – {ch.title}
            </h1>
            <a
              href={ch.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-ink-muted hover:text-forest transition-colors"
            >
              Open in Google Docs ↗
            </a>
          </div>
          <ChapterReader
            apiUrl={`/api/chapter?num=${ch.num}`}
            docUrl={ch.docUrl}
            startPage={startPage}
          />
        </div>
      </div>
    </section>
  );
}
