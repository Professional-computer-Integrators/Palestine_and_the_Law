/**
 * Configuration for every chapter of "Palestine and the Law".
 *
 * Page numbers are computed dynamically from the previous chapter's page count
 * (see lib/pageOffsets.ts). The anchor is Chapter 1 = page 11; subsequent
 * chapters continue the numbering. The `startPage` field below is unused at
 * runtime and kept only as documentation of the anchor value.
 */
export interface ChapterMeta {
  num: number;
  title: string;
  /** Public Google Docs "/pub" URL */
  docUrl: string;
  /** @deprecated start page is now computed; only Chapter 1's value (11) is used as the anchor in lib/pageOffsets.ts */
  startPage?: number;
}

export const CHAPTERS: ChapterMeta[] = [
  {
    num: 1,
    title: "Palestine in History",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vQFZZPPadgq_hkxCF_UM1wNVgAf0c8GfF346h_wUnmgU3D6noIRI9mZ62j8EPsjqwAY5BSK6LHFbA6L/pub",
    startPage: 11,
  },
  {
    num: 2,
    title: "Promises to the Arabs and the Jews",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRP-k2og4mf2BFVGjKnV2XztFCbe-rlZyD3KCiv_ktn9qaulmBo_1lApLXyo0zsOSxajYpQ_Mbsua75/pub",
    startPage: 1,
  },
  {
    num: 3,
    title: "Palestine at the End of World War I",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRiWTFcMPnnYGQsEakKdGqaYqe6Xjn2gDQx8SzBFlnE7er77qaS3KXnCzfKTEqgqOjsDAi1Po35G_qo/pub",
    startPage: 1,
  },
  {
    num: 4,
    title: "The Legal Status of Palestine under the Mandate",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vQ52HP5WUoPnruqUJFvLjWUNLGd61DLTrV42UgUJceFks87sbGaiDsVDr8X3hS-Y2y4b4poTQ53ObvH/pub",
    startPage: 1,
  },
  {
    num: 5,
    title: "Termination of Palestine Mandate",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vSHtM6FkMNQI_fOqzupTMbiLMTVKdFWbUAk2MixIZBMYhN2cD8BahgTZwXsexRglnhuarL3psTUQ1mi/pub",
    startPage: 1,
  },
  {
    num: 6,
    title:
      "The United Kingdom Refers the Problem of Palestine to the United Nations",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vQvWES1mFCpsZ_dkVuhwiioZExKhz2ATmb5atfRvJ6JQ7--8cyklc8Ie1YiYPz2XJWR4fRylK_WaYbd/pub",
    startPage: 1,
  },
  {
    num: 7,
    title: "Is The General Assembly's Partition Resolution Valid?",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRwHJgx8iva7GWkUy9ZVmNh2lWQRnYHXoRpDtqqBfwqH9Y50Yd9rbY-XfrKUmtiwmcWCeqlqZaMKX5q/pub",
    startPage: 1,
  },
  {
    num: 8,
    title: "Israel's Attitude Towards the Partition Resolution",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vTEw_ZQT3VwoKfoCQ2HeNt2zhEoVXTFbJWsy-420nTrbCTtu4AAVFZ0qug8MmMQKe27N3PbR4NaPREu/pub",
    startPage: 1,
  },
  {
    num: 9,
    title: "What are the Boundaries of Israel?",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vQeq1dFY8pDWjwHO_9liMA1kwm8vct7UsMOXpsGPgALxe5gZuSzqnYHw9iga7kkfZfO0psQ0sMc0qqx/pub",
    startPage: 1,
  },
  {
    num: 10,
    title: "Israel Claims New Boundaries After Armed Conflict",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRZtKOxFSeeAuzvMKmJSio79jBOcPuK-4IsTM1x3g4NXYo73a2Bhc6h9qpxbOvYTQu5AEN1iVhn5EZk/pub",
    startPage: 1,
  },
  {
    num: 11,
    title: "The General Assembly Resolved to Admit Israel to the UN on 11th May 1949",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vQ-knwuNpjV4k5FQsmSURaH4jgU6ImE20Co3JQAybvql2t8q6Qt852zMsHscjpIk98SDI5Nbz9JDNwb/pub",
    startPage: 1,
  },
  {
    num: 12,
    title: "The History of the Principle of Self-Determination",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRJ1c162xG2tqXkKouGkvQ2UjMSpwR1hjTO7SC8oAgpOURFrpEhH4rX6wR0LE7T0czhZmy9ajAZhRcy/pub",
    startPage: 1,
  },
  {
    num: 13,
    title: "The Palestinians' Right of Return",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRhXznjZhyZ5gaSpu9Qh5gYmkjCPVVIbyDzmH4reswp3u0fthfgYm9JWB7yVaTn00H1p8bDOEwAEkAa/pub",
    startPage: 1,
  },
  {
    num: 14,
    title: "Security Council Resolution 242",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vQ8fjQg8yWk1eg7na5tpzbHK5f0072c56NJS5IMQyReCOhijG2t3HhgvIIRZ0n02NAuLww8uur21Ge2/pub",
    startPage: 1,
  },
  {
    num: 15,
    title: "The Status of Jerusalem",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRL46mTnuow5K90MrXxBqtJdX6XQDdlbm6WakHwAjJ_eJlJyR9wqeyKTZIXLldbeRkJPG_CGoQBhbjr/pub",
    startPage: 1,
  },
  {
    num: 16,
    title: "Palestine and Jordan: Merger and Separation",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRAmUSGyGusSAVmY25w5iwBY5yX_rsvswqgMihRsMPCyC4pyEOaBhbpoueSelMuHkbuRGSlhGXcU_Oz/pub",
    startPage: 1,
  },
  {
    num: 17,
    title: "Palestine's Declaration of Independence",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vTpf1mwjkhkqBt5iqUZj7GAJ7x93cI5tXEXpC3ksudMAUcw0PkTenRfpFgd0EOsX8WCxLuAcZr5guh9/pub",
    startPage: 1,
  },
  {
    num: 18,
    title: "A Pro-Israel Response",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vQTiGjX3lQD8mCIlK6lPSyNCJF21G5hNBBmzX5y2lRtOCKu5ZnpnvNHGCgEKdLAvHDvbqSwV8Rmlurz/pub",
    startPage: 1,
  },
  {
    num: 19,
    title: "Update",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vTKPKSuMvXgC7zQF1wDqdXwRU4m55ZYbakRAAVxwR_TWoN1KF3XMsxcjxYo7I-5tVvphjcPJWWzVoF9/pub",
    startPage: 1,
  },
];

export function getChapter(num: number | string): ChapterMeta | undefined {
  const n = typeof num === "string" ? parseInt(num, 10) : num;
  return CHAPTERS.find((c) => c.num === n);
}
