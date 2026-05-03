/**
 * Configuration for every appendix of "Palestine and the Law".
 *
 * Page numbers are computed dynamically from the previous appendix's page
 * count (see lib/appendixOffsets.ts). Appendix I begins at page 296 to
 * match the printed book; subsequent appendices continue from where the
 * previous one ended.
 */
export interface AppendixMeta {
  /** Sequential index 1..8 — used in the URL (/appendix/1 … /appendix/8). */
  num: number;
  /** Printed Roman numeral as it appears in the book. */
  roman: string;
  title: string;
  desc: string;
  /** Public Google Docs "/pub" URL */
  docUrl: string;
}

export const APPENDICES: AppendixMeta[] = [
  {
    num: 1,
    roman: "I",
    title: "Declaration of Principles on Interim Self-Government Arrangements",
    desc: "By the Government of Israel and Palestine Liberation Organization — 13th September 1993.",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vSd4jKieYwYqvfRzb65V5oMPX-tgz8YnMgw9rb99c3JY2mBdPrBxN8Hgm8z1sly4vqZ7ZEVWocoGalg/pub",
  },
  {
    num: 2,
    roman: "II",
    title: "Mandate from the League of Nations to the British Government",
    desc: "For the administration of Palestine.",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vSs6v_0FHbM7UwN2ojo-Unmsfg2pi4ZXymbWb0gbnBC8CnliwJzS_V4AIvBLtNr8A/pub",
  },
  {
    num: 3,
    roman: "III",
    title: "Amendment of Article 25 of the Palestinian Mandate",
    desc: "Documenting the formal amendment to the terms of the Mandate.",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vSuOpKfbmfR_tc847PVrBKbpOBya99p7RyerpFNKVPZoXbclbMW2b1ZA1MuYGtcNA/pub",
  },
  {
    num: 4,
    roman: "IV",
    title: "The UN Partition Resolution",
    desc: "The full text of UN General Assembly Resolution 181 (II) — 29th November 1947.",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vQ3PWwUGbvXGOan4QM8L5ZnSvXEYgFhAC88OJFlhmm7pJICCvrbR27O2v695gT3iA/pub",
  },
  {
    num: 5,
    roman: "V",
    title: "UN Self-Determination for Peoples",
    desc: "UN General Assembly Resolution — 14th December 1960.",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vTDV74YOZPkoZUkqilLghY7T4i4uTpTe4rCVlxKn4Py9uNdc5uB0x0fKz4WJWfRfiJDg1lqapw1C-nv/pub",
  },
  {
    num: 6,
    roman: "VI",
    title: "The Right of Return of the Palestinian People",
    desc: "UN General Assembly Resolution 194 dated 11th December 1948 and subsequent UN resolutions.",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vSk_xqSIlposSPQzhH3AjS7Tx1YzYQUfOJ2s9VvhoDUu45AhX7X6QilDYI1XiMw_fgOSpfhO8zbui6i/pub",
  },
  {
    num: 7,
    roman: "VII",
    title: "Jerusalem's Holy Places under the Mandate",
    desc: "Order in Council — 19th May 1931.",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRpFBqRYQKGMs8rxpVZzTG7Na__83HkjuXbo7gGEJDDOVHLe2SQoIn5t6Lw0awzMy_7tH8a-iRXNOAP/pub",
  },
  {
    num: 8,
    roman: "VIII",
    title: "Declaration of Independence of the State of Palestine",
    desc: "The text of Palestine's Declaration of Independence.",
    docUrl:
      "https://docs.google.com/document/d/e/2PACX-1vRaExA6fgZTvDS76vRUudI6cSzqccWxUKViCYA_xzle51qbdQvS3j4TwP0K4nhP-pvRgyaF381M0FlM/pub",
  },
];

export function getAppendix(num: number | string): AppendixMeta | undefined {
  const n = typeof num === "string" ? parseInt(num, 10) : num;
  return APPENDICES.find((a) => a.num === n);
}
