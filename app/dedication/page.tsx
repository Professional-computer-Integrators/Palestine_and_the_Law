import Link from "next/link";

const acknowledgements = [
  {
    source: "Peter Brookes, The Times",
    detail:
      'The cartoon "Who will make amends for 242?" © Peter Brookes, The Times, 25 February 1986, is reproduced with the permission of Times Newspapers Limited.',
  },
  {
    source: "American Society of International Law",
    detail:
      'Extracts from "The General Principles Governing the Termination of a Mandate" by Luther Harris Evans are produced with the permission of 26 AJIL 735 (1932).',
  },
  {
    source: "American Society of International Law",
    detail:
      'Extracts from "The Middle East Problem" by Quincy Wright are reproduced with the permission of 64 AJIL 270 (1970).',
  },
  {
    source: "American Society of International Law",
    detail:
      'Extracts from "Legal Aspects of the Search for Peace in the Middle East" by Eugene V. Rostow are reproduced with the permission of 64 ASIL Proc. 64 (1970).',
  },
  {
    source: "Addison Wesley Longman Ltd.",
    detail:
      "Extracts from The Mandate for Palestine: A Contribution to the Theory and Practice of International Mandates by J. Stoyanovsky (1928) and The Mandates System by Norman Bentwich (1930) are reproduced with the permission of Addison Wesley Longman Ltd.",
  },
  {
    source: "Cambridge University Press",
    detail:
      "Extracts from International Law – Being the Collected Papers of Hersch Lauterpacht edited by E. Lauterpacht (1977) are reproduced with the permission of Cambridge University Press.",
  },
  {
    source: "Oxford University Press",
    detail:
      'Extracts from "General Assembly Resolutions revisited (forty years later)", British Yearbook of International Law by F. Blaine Sloane (1987) and Collusion Across the Jordan by Avi Shlaim (1988) are reproduced with the permission of Oxford University Press.',
  },
  {
    source: "Princeton University Press",
    detail:
      "Extracts from The Arab-Israeli Conflict edited by John Norton Moore (1974) are reproduced with the permission of Princeton University Press.",
  },
  {
    source: "The British Institute of International and Comparative Law",
    detail:
      'Extracts from "United Nations Competence in the West Bank and Gaza" by Mahnoush H. Arsanjani are reproduced from (1982) 31 I.C.L.Q 426 with the permission of the British Institute of International and Comparative Law, 17 Russell Square, London WC1B 5DR.',
  },
  {
    source: "Manchester University Press",
    detail:
      "Acts from The Acquisition of Territory in International Law by J. Y. Jennings are reproduced with the permission of Manchester University Press.",
  },
  {
    source: "United Nations",
    detail:
      "United Nations maps nos. 3067 and 104 are reproduced with the permission of the Cartographic Section of the Department of Public Information at the United Nations.",
  },
  {
    source: "Further Acknowledgements",
    detail:
      "The publishers also acknowledge the cooperation of The Guardian, Tribune, Frank Cass & Co. Ltd., The Magnes Press, the Department of Public Information at the United Nations, Establishment Emile Bruylant, E. Lauterpacht, the publishers of The Belgian Review of International Law, IC Publications Ltd. and others.",
  },
];

export default function DedicationPage() {
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
            Dedication &amp; Acknowledgements
          </h1>
          <div className="gold-divider mx-auto" />
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L1440 40L1440 0C1440 0 1200 30 720 20C240 10 0 0 0 0L0 40Z" fill="#faf8f4" />
          </svg>
        </div>
      </section>

      {/* Dedication */}
      <section className="py-20 bg-parchment">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white border border-cream-dark rounded-sm shadow-sm px-10 py-14 text-center">
            {/* decorative quote marks */}
            <span className="absolute top-4 left-8 font-serif text-7xl text-gold/20 leading-none select-none">
              &ldquo;
            </span>
            <span className="absolute bottom-4 right-8 font-serif text-7xl text-gold/20 leading-none select-none">
              &rdquo;
            </span>

            <p className="font-sans text-gold text-xs tracking-[0.3em] uppercase mb-6">
              Dedication
            </p>
            <p className="font-serif text-xl md:text-2xl text-forest font-medium leading-relaxed mb-6">
              To my wife{" "}
              <span className="text-gold font-semibold">Mai Yousef Sabbagh</span>{" "}
              and my children{" "}
              <span className="font-semibold">Josephine, Elias and Carmen</span>,
            </p>
            <p className="font-sans text-base text-gray-600 italic leading-relaxed">
              without whose insistence and constant support this book would not
              have been written.
            </p>

            <div className="gold-divider mx-auto mt-8" />
            <p className="font-sans text-sm text-gray-400 mt-4">
              — Professor Musa E. Mazzawi
            </p>
          </div>
        </div>
      </section>

      {/* Acknowledgements */}
      <section className="py-16 bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-serif text-2xl font-bold text-forest">
              Acknowledgements
            </h2>
            <div className="flex-1 h-px bg-cream-dark" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {acknowledgements.map((ack, i) => (
              <div key={i} className="card p-5 flex gap-4 group hover:border-gold/30 transition-colors duration-200">
                <div className="flex-shrink-0 w-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors duration-200" />
                <div>
                  <h3 className="font-sans text-xs font-semibold text-gold uppercase tracking-wide mb-2">
                    {ack.source}
                  </h3>
                  <p className="font-sans text-sm text-gray-600 leading-relaxed">
                    {ack.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="py-10 bg-parchment text-center">
        <Link href="/" className="btn-outline">
          ← Back to Home
        </Link>
      </div>
    </>
  );
}
