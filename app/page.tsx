import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import EditableText from "@/components/EditableText";

export default function HomePage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">

        {/* Spacer for the absolutely-positioned horizontal nav bar (~44px tall) */}
        <div className="hidden md:block h-11" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-4">
            {/* Subtitle */}
            <EditableText
              id="home.hero.subtitle"
              defaultText="A comprehensive legal study of the Arab-Israel conflict and the Palestinian question during the 20th century."
              tag="p"
              className="font-sans text-base text-cream/60 leading-relaxed max-w-lg text-center"
              label="Hero subtitle"
            />

            {/* Book image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gold/70 rounded-sm blur-2xl animate-pulse" />
              <div className="relative bg-forest-light border border-gold/30 rounded-sm p-4 shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl">
                <Image
                  src="https://i0.wp.com/palestineandthelaw.org/wp-content/uploads/2025/10/bluebook4-1-2.jpg?w=407&ssl=1"
                  alt="Palestine and the Law book cover"
                  width={407}
                  height={550}
                  className="w-full h-auto rounded-sm"
                  style={{ aspectRatio: "5 / 6", objectFit: "fill" }}
                  priority
                  unoptimized
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contents" className="btn-outline border-cream/40 text-cream hover:bg-surface/10 hover:text-cream">
                Explore Chapters
              </Link>
              <Link href="#about-book" className="btn-outline border-cream/40 text-cream hover:bg-surface/10 hover:text-cream">
                About the Book
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ── ABOUT THE BOOK ───────────────────────────────────── */}
      <section id="about-book" className="py-20 md:py-28 bg-parchment">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            {/* Sticky label */}
            <ScrollReveal direction="left" className="md:col-span-2">
              <p className="font-sans text-gold text-xs tracking-[0.3em] uppercase mb-3">
                The Work
              </p>
              <h2 className="section-heading mb-4">About the Book</h2>
              <div className="gold-divider" />
              <p className="font-sans text-sm text-forest/60 mt-6 leading-relaxed">
                Published 1997 · First Edition
                <br />
                ISBN: 0 86372 222 9
                <br />
                British Library catalogued
              </p>
              <div className="mt-8">
                <Link href="/contents" className="btn-primary">
                  Read Chapter Overviews
                </Link>
              </div>
            </ScrollReveal>

            {/* Body text */}
            <ScrollReveal direction="right" delay={150} className="md:col-span-3 space-y-5">
              <EditableText id="home.about.0" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Book — §1"
                defaultText="Palestine and the Law is a comprehensive study of the international legal principles and framework concerning the question of Israel and Palestine. Written by the renowned public international lawyer, Professor Musa Mazzawi, and published in 1997, the book provides legal guidelines for the resolution of the conflict." />
              <EditableText id="home.about.1" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Book — §2"
                defaultText="It covers in detail the period from ancient times until the Oslo Accords of 1993, focusing on the origins of the conflict, the Mandate system for Palestine, the validity of the UN Partition Resolution and the continuing role and status of the United Nations in relation to Palestine." />
              <EditableText id="home.about.2" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Book — §3"
                defaultText="The book also considers the status of Jerusalem — designated by the UN in the Partition Resolution as a special international zone or corpus separatum — given its significance to three major world religions." />
              <EditableText id="home.about.3" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Book — §4"
                defaultText="The book makes the legal case for the continuing validity of the UN Partition Resolution; interpreting UN Resolution 242 to support Israel's withdrawal from the occupied territories; the Palestinians' right to self-determination; and the extent of the right of return for Palestinian refugees." />
              <EditableText id="home.about.4" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Book — §5"
                defaultText="Grounded in a rigorous analysis of the law, the book draws on detailed contemporaneous source material, including records, interpretations and policy emanating from the UK and US governments, members of the United Nations Security Council and the founders of the State of Israel." />
              <EditableText id="home.about.5" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Book — §6"
                defaultText="Palestine and the Law has drawn praise for its extensive analysis of, and adherence to, the legal position and its avoidance of political argumentation. It remains an invaluable resource for anyone seeking a deeper understanding of the legal dimensions of the Arab-Israel conflict." />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── KEY THEMES ───────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
          <div className="text-center mb-14">
            <p className="font-sans text-gold text-xs tracking-[0.3em] uppercase mb-3">
              Core Legal Questions
            </p>
            <h2 className="section-heading inline-block">Key Themes</h2>
            <div className="gold-divider mx-auto" />
          </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                number: "I",
                title: "The UN Partition Resolution",
                desc: "The continuing validity of Resolution 181 (II) and its legal force as the basis for both states.",
              },
              {
                number: "II",
                title: "The Mandate System",
                desc: "The legal status of Palestine under the British Mandate and the United Nations' assumption of trustee responsibilities.",
              },
              {
                number: "III",
                title: "Jerusalem & Corpus Separatum",
                desc: "The internationally designated special status of Jerusalem under the Partition Resolution, significant to three world religions.",
              },
              {
                number: "IV",
                title: "Right of Self-Determination",
                desc: "The inalienable rights of the Palestinian people, enshrined in the UN Charter and multiple General Assembly resolutions.",
              },
              {
                number: "V",
                title: "The Right of Return",
                desc: "Over 100 UN resolutions reaffirm the right of displaced Palestinians to return to their homes or receive compensation.",
              },
              {
                number: "VI",
                title: "UN Security Council Res. 242",
                desc: "Requiring Israeli withdrawal from territories occupied in 1967 — a detailed analysis of contested interpretations.",
              },
            ].map((theme, i) => (
              <ScrollReveal key={theme.number} direction="up" delay={i * 80}>
              <div className="card p-6 group">
                <span className="font-serif text-4xl font-bold text-forest/10 group-hover:text-gold/30 transition-colors duration-300">
                  {theme.number}
                </span>
                <h3 className="font-serif text-lg font-semibold text-forest mt-2 mb-2">
                  {theme.title}
                </h3>
                <div className="w-8 h-0.5 bg-gold mb-3" />
                <p className="font-sans text-sm text-ink-muted leading-relaxed">
                  {theme.desc}
                </p>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT THE AUTHOR ────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-parchment">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            {/* Author image */}
            <ScrollReveal direction="left" className="md:col-span-2 flex flex-col items-center md:items-start">
              <div className="relative w-56 h-64 md:w-64 md:h-72 rounded-sm overflow-hidden border-4 border-gold/40 shadow-xl mb-6">
                <Image
                  src="https://i0.wp.com/palestineandthelaw.org/wp-content/uploads/2025/08/cropped-MrM.jpg?w=1088&ssl=1"
                  alt="Professor Musa E. Mazzawi"
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
              </div>
              <h3 className="font-serif text-xl font-bold text-forest text-center md:text-left">
                Professor Musa E. Mazzawi
              </h3>
              <p className="font-sans text-sm text-gold mt-1 text-center md:text-left">
                LL.M, Ph.D (London)
              </p>
            </ScrollReveal>

            {/* Bio text */}
            <ScrollReveal direction="right" delay={150} className="md:col-span-3">
              <p className="font-sans text-gold text-xs tracking-[0.3em] uppercase mb-3">
                The Author
              </p>
              <h2 className="section-heading mb-4">About the Author</h2>
              <div className="gold-divider" />
              <div className="mt-6 space-y-4">
                <EditableText id="home.author.0" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Author — §1"
                  defaultText="Formerly Dean of the Faculty of Law at what is now the University of Westminster, Professor Mazzawi was widely recognised as one of the leading legal scholars on the topic of Israel-Palestine." />
                <EditableText id="home.author.1" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Author — §2"
                  defaultText="Professor Mazzawi was born in Palestine and came to the UK to study law, subsequently taking a PhD in international law and practising at the Bar as a member of Gray's Inn. He advised numerous governments and state institutions on issues relating to their constitutions, territorial rights and other public international law matters." />
                <EditableText id="home.author.2" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Author — §3"
                  defaultText='He was the author of numerous publications on the issue in addition to "Palestine and the Law", and also on the question of Rhodesia. His views on the Middle East and the application of international law were frequently sought out in UK and international radio and television current affairs programmes.' />
                <EditableText id="home.author.3" tag="p" className="font-sans text-base text-ink leading-relaxed" label="About the Author — §4"
                  defaultText="The publication of this study in 1997 reflected the author's fervent hope that the clarification of the relevant legal principles and the resort to the law for resolving the dispute would lead to a just and lasting peace in the Middle East." />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ───────────────────────────────────── */}
      <section className="py-20 bg-forest relative overflow-hidden">

        <ScrollReveal direction="up" className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-gold text-xs tracking-[0.3em] uppercase mb-4">
            19 Chapters · 8 Appendices
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cream mb-4">
            Explore the Complete Study
          </h2>
          <div className="gold-divider mx-auto" />
          <p className="font-sans text-base text-cream/60 mt-6 mb-10 leading-relaxed">
            <EditableText
              id="home.cta.desc"
              defaultText="From ancient history through to the Oslo Accords of 1993 — each chapter provides a rigorous analysis of the legal principles governing the Israel-Palestine conflict."
              label="CTA description"
            />
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contents" className="btn-outline border-cream/40 text-cream hover:bg-surface/10 hover:text-cream">
              View All Chapters
            </Link>
            <Link href="/contact" className="btn-outline border-cream/40 text-cream hover:bg-surface/10 hover:text-cream">
              Get in Touch
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
