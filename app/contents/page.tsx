"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import EditableText from "@/components/EditableText";

const chapters = [
  {
    num: 1,
    title: "Palestine in History",
    desc: "Charts the history of the land of Palestine, from very early times up to the First World War. Cites the 1930 League of Nations Study reflecting thirteen centuries of Muslim rule of the territory. The Study found that in 1918, more than 90% of the population of Palestine comprised Palestinian Arabs and less than 10% Jews.",
  },
  {
    num: 2,
    title: "Promises to the Arabs and the Jews",
    desc: "Addresses the position of Palestine at the time of the First World War, including agreements made between the Russians, French and British for the break-up of the Turkish Empire of which Palestine was a part. Considers the terms and validity of British promises with respect to Palestine given to Arabs and Jews — to the Sherif of Mecca in 1915/16 and in the Balfour Declaration of 1917.",
  },
  {
    num: 3,
    title: "Palestine at the End of World War I",
    desc: "Describes the Mandate System introduced by the League of Nations in 1919 after the First World War, and the terms of the Mandate for Palestine confirmed in 1922, which entrusted Great Britain with the Palestine Mandate. The territorial boundaries of the land of Palestine were clarified prior to the Mandate's commencement.",
  },
  {
    num: 4,
    title: "The Legal Status of Palestine under the Mandate",
    desc: "Contains extensive consideration of the arguments concerning the legal status of Palestine during the Mandate and after the League of Nations' demise. Despite the dissolution of the League, the Mandate over Palestine remained valid; the sacred trust of civilisation regarding the Mandated territory and the Palestinian people was assumed by the United Nations.",
  },
  {
    num: 5,
    title: "Termination of Palestine Mandate",
    desc: "Considers whether, and how, a Mandate could be terminated and the legal status of the Mandated territory after that. The conditions necessary for the termination of a Mandate were not satisfied in the case of the Arab part of the territory of Mandated Palestine; as such, the United Nations continued to have responsibility for that territory.",
  },
  {
    num: 6,
    title: "The United Kingdom Refers the Problem of Palestine to the United Nations",
    desc: "Refers to the British Government's view that the future Government to be established in Palestine was a matter for the UN General Assembly to determine. Cites excerpts from the 1947 UN Special Committee report on Palestine and introduces briefly the UN Partition Resolution.",
  },
  {
    num: 7,
    title: "Is The General Assembly's Partition Resolution Valid?",
    desc: "The validity of the UN Partition Resolution on the future Government of Palestine (Resolution 181 (II)) has been a source of profound legal controversy. The chapter examines in detail various legal arguments concerning the validity of the Resolution that have been put forward by different jurists.",
  },
  {
    num: 8,
    title: "Israel's Attitude Towards the Partition Resolution",
    desc: "Cites and discusses contemporaneous material relating to Israel's attitude towards the Partition Resolution, concluding that the frequent and specific references to the UN Partition Resolution by Israel cannot be disregarded and are both relevant and significant as regards a determination of the rights and duties of Arabs and Israelis.",
  },
  {
    num: 9,
    title: "What are the Boundaries of Israel?",
    desc: "Examination of what, in law, are the boundaries of Israel. Refers to the 1947 Declaration of the State of Israel and correspondence between the Provisional Government of Israel and the UN — Israel noting repeatedly that the UN Partition Resolution was the basis of the legitimacy of Israel.",
  },
  {
    num: 10,
    title: "Israel Claims New Boundaries After Armed Conflict",
    desc: "Following the armed conflicts in 1949 and 1967, Israel sought to assert title to territory beyond that envisaged in the Partition Resolution. However, as Israel had accepted the Partition Resolution as the basis of its title, adaptations of territorial specifications would only be valid insofar as they left the Partition Plan substantially intact. The UN has repeatedly reaffirmed the inadmissibility of the acquisition of territory by war.",
  },
  {
    num: 11,
    title: "Israel's Application for Membership in the United Nations",
    desc: "The UN General Assembly resolved to admit Israel to the UN on 11th May 1949. The admission was based on Israel's unreserved acceptance of the obligations of the UN Charter, with assurances that Israel would abide by the Partition Resolution and that the displaced Palestinians had the right to return or be compensated.",
  },
  {
    num: 12,
    title: "The Palestinians' Right to Self-Determination",
    desc: "Describes the history of the principle of self-determination, early formulations of which were expressed by the US as the \"right of native races to dispose freely of themselves and of their hereditary soil\" — subsequently enshrined in the UN Charter, the Universal Declaration of Human Rights and several other UN resolutions.",
  },
  {
    num: 13,
    title: "The Palestinians' Right of Return",
    desc: "An estimated two million Palestinians were displaced by the hostilities in 1947/48 and 1967. More than 100 United Nations Resolutions reaffirmed the Palestinians' right of return and entitlement to compensation. The chapter concludes that the Palestinians' right of return cannot be compromised or vitiated under international law.",
  },
  {
    num: 14,
    title: "Security Council Resolution 242",
    desc: "As a result of the hostilities of the Six Day War in 1967, Israel occupied East Jerusalem, the West Bank, Gaza, the Golan Heights and Sinai. UN Security Council Resolution 242 required Israel to withdraw its armed forces from territories occupied in the recent conflict. The chapter discusses the Resolution and its contested legal interpretations, concluding that it was intended to effect withdrawal from all occupied territories.",
  },
  {
    num: 15,
    title: "The Status of Jerusalem",
    desc: "Because of Jerusalem's deep significance to Judaism, Christianity and Islam, the Partition Resolution provided that Jerusalem should have the legal status of a special international zone, or corpus separatum. The chapter submits that the international law concept of corpus separatum for Jerusalem remains legally valid.",
  },
  {
    num: 16,
    title: "Palestine and Jordan: Merger and Separation",
    desc: "The Palestinian territory occupied in 1948 by Jordanian armed forces was merged with Jordan in 1950. Serious questions arose as to the validity of the decision to merge. The West Bank was separated in 1988 at the request of the Palestine Liberation Organization.",
  },
  {
    num: 17,
    title: "Palestine's Declaration of Independence",
    desc: "Addresses Palestine's Declaration of Independence in 1988, and its validity and legal effect. The same year, the UN General Assembly resolved to use the designation \"Palestine\" in place of \"Palestine Liberation Organization\" in the UN system.",
  },
  {
    num: 18,
    title: "A Pro-Israel Response",
    desc: "Professor Julius Stone, Professor at the University of California Hastings College of Law, wrote extensively in support of Zionism and the policies of the government of Israel. This chapter examines and responds to his work as a whole, providing a rigorous legal critique.",
  },
  {
    num: 19,
    title: "Update",
    desc: "Refers to the Declaration of Principles in Washington of 1993 and subsequent events until 1996. Key problems remain outstanding between Israel and the Palestinians: will there be a state of Palestine?; the handing over of territory; the status of Jerusalem; Jewish settlements in occupied territory; the refugees and the question of return.",
  },
];

const appendices = [
  {
    num: "I",
    title: "Declaration of Principles on Interim Self-Government Arrangements",
    desc: "By the Government of Israel and Palestine Liberation Organization — 13th September 1993.",
  },
  {
    num: "II",
    title: "Mandate from the League of Nations to the British Government",
    desc: "For the administration of Palestine.",
  },
  {
    num: "III",
    title: "Amendment of Article 25 of the Palestinian Mandate",
    desc: "Documenting the formal amendment to the terms of the Mandate.",
  },
  {
    num: "IV",
    title: "The UN Partition Resolution",
    desc: "The full text of UN General Assembly Resolution 181 (II) — 29th November 1947.",
  },
  {
    num: "V",
    title: "UN Self-Determination for Peoples",
    desc: "UN General Assembly Resolution — 14th December 1960.",
  },
  {
    num: "VI",
    title: "The Right of Return of the Palestinian People",
    desc: "UN General Assembly Resolution 194 dated 11th December 1948 and subsequent UN resolutions.",
  },
  {
    num: "VII",
    title: "Jerusalem's Holy Places under the Mandate",
    desc: "Order in Council — 19th May 1931.",
  },
  {
    num: "VIII",
    title: "Declaration of Independence of the State of Palestine",
    desc: "The text of Palestine's Declaration of Independence.",
  },
];

export default function ContentsPage() {
  return (
    <>
      {/* Page header */}
      <section className="py-20 relative overflow-hidden">

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Palestine and the Law
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-4">
            Overview of Chapters
          </h1>
          <div className="gold-divider mx-auto" />
          <EditableText
            id="contents.header.subtitle"
            defaultText="The book comprises 19 chapters covering the period from ancient times to the Oslo Accords of 1993, together with 8 documentary appendices."
            tag="p"
            className="font-sans text-base text-cream/60 mt-6 max-w-xl mx-auto leading-relaxed"
            label="Contents — page subtitle"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L1440 40L1440 0C1440 0 1200 30 720 20C240 10 0 0 0 0L0 40Z" fill="#f4f8fc" />
          </svg>
        </div>
      </section>

      {/* Chapters */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-serif text-2xl font-bold text-forest">Chapters</h2>
            <div className="flex-1 h-px bg-cream-dark" />
            <span className="font-sans text-sm text-ink-muted">1 – 19</span>
          </div>

          <div className="space-y-4">
            {chapters.map((ch, i) => {
              const isClickable = true; // all 19 chapters are now available
              const cardClasses = `card p-6 flex gap-6 group hover:border-gold/40 transition-colors duration-200 ${
                isClickable ? "cursor-pointer hover:shadow-md" : ""
              }`;
              const cardInner = (
              <div className={cardClasses}>
                {/* Chapter number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-forest flex items-center justify-center group-hover:bg-gold transition-colors duration-200">
                  <span className="font-serif text-sm font-bold text-cream">
                    {ch.num}
                  </span>
                </div>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-lg font-semibold text-forest mb-2 leading-tight">
                      Chapter {ch.num} – {ch.title}
                    </h3>
                    {isClickable && (
                      <span
                        className="flex-shrink-0 flex items-center gap-1 font-sans text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full mt-0.5"
                        style={{
                          background: "rgb(var(--color-primary) / 0.12)",
                          color: "rgb(var(--color-primary))",
                          border: "1px solid rgb(var(--color-primary) / 0.25)",
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        Read Chapter
                      </span>
                    )}
                  </div>
                  <EditableText
                    id={`chapter.${ch.num}.desc`}
                    defaultText={ch.desc}
                    tag="p"
                    className="font-sans text-sm text-ink-muted leading-relaxed"
                    label={`Chapter ${ch.num} — description`}
                  />
                </div>
              </div>
              );
              return (
              <ScrollReveal key={ch.num} direction="up" delay={i < 5 ? i * 60 : 0}>
                {isClickable ? (
                  <Link href={`/chapter/${ch.num}`} className="block no-underline text-inherit">
                    {cardInner}
                  </Link>
                ) : (
                  cardInner
                )}
              </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Appendices */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-serif text-2xl font-bold text-forest">Appendices</h2>
            <div className="flex-1 h-px bg-cream-dark" />
            <span className="font-sans text-sm text-ink-muted">I – VIII</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {appendices.map((app, i) => (
              <ScrollReveal key={app.num} direction="up" delay={i * 60}>
              <div
                className="card p-5 flex gap-4 group hover:border-gold/40 transition-colors duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-gold/20 border border-gold/30 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-colors duration-200">
                  <span className="font-serif text-xs font-bold text-forest group-hover:text-forest-dark transition-colors duration-200">
                    {app.num}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-forest mb-1 leading-tight">
                    Appendix {app.num}
                  </h3>
                  <p className="font-sans text-sm font-medium text-ink mb-1">{app.title}</p>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">{app.desc}</p>
                </div>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Back to home CTA */}
      <div className="py-10 text-center">
        <Link href="/" className="btn-outline">
          ← Back to Home
        </Link>
      </div>
    </>
  );
}
