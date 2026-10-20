// Theme constants shared by the client ThemeContext and the server layout
// (which inlines the saved theme so the first paint already matches it).
import { hexToRgb, lighten, darken } from "@/lib/colorUtils";

export const DEFAULT_PRIMARY = "#3a543f";
export const DEFAULT_FONT_OPTION = "corporate";

export const FONT_OPTIONS = [
  // ── Serif heading + Sans body ──────────────────────────────────────
  { id: "classic",    label: "Classic — Playfair Display + Inter",         headingVar: "--font-playfair",    bodyVar: "--font-inter" },
  { id: "editorial",  label: "Editorial — Lora + Open Sans",               headingVar: "--font-lora",        bodyVar: "--font-opensans" },
  { id: "scholarly",  label: "Scholarly — Crimson Text + Source Sans",     headingVar: "--font-crimson",     bodyVar: "--font-sourcesans" },
  { id: "elegant",    label: "Elegant — EB Garamond + Raleway",            headingVar: "--font-garamond",    bodyVar: "--font-raleway" },
  { id: "literary",   label: "Literary — Cormorant Garamond + Nunito",     headingVar: "--font-cormorant",   bodyVar: "--font-nunito" },
  { id: "academic",   label: "Academic — Libre Baskerville + Libre Franklin", headingVar: "--font-baskerville", bodyVar: "--font-franklin" },
  { id: "heritage",   label: "Heritage — Spectral + Karla",               headingVar: "--font-spectral",    bodyVar: "--font-karla" },
  { id: "refined",    label: "Refined — Cardo + Cabin",                   headingVar: "--font-cardo",       bodyVar: "--font-cabin" },
  { id: "classic2",   label: "Classic II — Libre Caslon + Mulish",        headingVar: "--font-caslon",      bodyVar: "--font-mulish" },
  { id: "journal",    label: "Journal — Domine + Fira Sans",              headingVar: "--font-domine",      bodyVar: "--font-firasans" },
  // ── Sans heading + Sans body ────────────────────────────────────────
  { id: "modern",     label: "Modern — Merriweather + Roboto",            headingVar: "--font-merriweather", bodyVar: "--font-roboto" },
  { id: "clean",      label: "Clean — Work Sans + DM Sans",               headingVar: "--font-worksans",    bodyVar: "--font-dmsans" },
  { id: "geometric",  label: "Geometric — Josefin Sans + Jost",           headingVar: "--font-josefin",     bodyVar: "--font-jost" },
  { id: "minimal",    label: "Minimal — Outfit + Manrope",                headingVar: "--font-outfit",      bodyVar: "--font-manrope" },
  { id: "corporate",  label: "Corporate — Barlow + IBM Plex Sans",        headingVar: "--font-barlow",      bodyVar: "--font-ibmplexsans" },
  // ── Display / expressive ────────────────────────────────────────────
  { id: "bold",       label: "Bold — Syne + Space Grotesk",               headingVar: "--font-syne",        bodyVar: "--font-spacegrotesk" },
  { id: "humanist",   label: "Humanist — Tenor Sans + Plus Jakarta Sans", headingVar: "--font-tenorsans",   bodyVar: "--font-jakarta" },
  { id: "newspaper",  label: "Newspaper — Zilla Slab + PT Sans",          headingVar: "--font-zillaslab",   bodyVar: "--font-ptsans" },
  { id: "academic2",  label: "Academic II — Fraunces + Nunito Sans",      headingVar: "--font-fraunces",    bodyVar: "--font-nunitosans" },
  { id: "typewriter", label: "Typewriter — Roboto Slab + Roboto Mono",    headingVar: "--font-robotoslab",  bodyVar: "--font-robotomono" },
  // ── Extra sans-serif ────────────────────────────────────────────────
  { id: "poppins",     label: "Poppins — Poppins + Poppins",               headingVar: "--font-poppins",     bodyVar: "--font-poppins" },
  { id: "montserrat",  label: "Montserrat — Montserrat + Montserrat",       headingVar: "--font-montserrat",  bodyVar: "--font-montserrat" },
  { id: "urbanist",    label: "Urbanist — Urbanist + Urbanist",             headingVar: "--font-urbanist",    bodyVar: "--font-urbanist" },
  { id: "lexend",      label: "Lexend — Lexend + Lexend",                   headingVar: "--font-lexend",      bodyVar: "--font-lexend" },
  { id: "figtree",     label: "Figtree — Figtree + Figtree",               headingVar: "--font-figtree",     bodyVar: "--font-figtree" },
  { id: "redhat",      label: "Red Hat — Red Hat Display + Epilogue",       headingVar: "--font-redhat",      bodyVar: "--font-epilogue" },
  { id: "epilogue",    label: "Epilogue — Epilogue + Epilogue",             headingVar: "--font-epilogue",    bodyVar: "--font-epilogue" },
  { id: "hahmlet",     label: "Hahmlet — Hahmlet + Urbanist",              headingVar: "--font-hahmlet",     bodyVar: "--font-urbanist" },
  { id: "mplus1",      label: "M PLUS 1 — M PLUS 1 + Lexend",             headingVar: "--font-mplus1",      bodyVar: "--font-lexend" },
  { id: "ntr",         label: "NTR — NTR + Open Sans",                     headingVar: "--font-ntr",         bodyVar: "--font-opensans" },
  // ── Serif + Sans combinations ────────────────────────────────────────
  { id: "imperial",      label: "Imperial — Cinzel + Montserrat",              headingVar: "--font-cinzel",       bodyVar: "--font-montserrat" },
  { id: "cinzeldm",      label: "Cinzel & DM Sans — Cinzel + DM Sans",         headingVar: "--font-cinzel",       bodyVar: "--font-dmsans" },
  { id: "magazine",      label: "Magazine — Abril Fatface + Lato",             headingVar: "--font-abrilfatface", bodyVar: "--font-lato" },
  { id: "bodoniurban",   label: "Bodoni & Urbanist — Bodoni Moda + Urbanist",  headingVar: "--font-bodonim",      bodyVar: "--font-urbanist" },
  { id: "bodoniepi",     label: "Bodoni & Epilogue — Bodoni Moda + Epilogue",  headingVar: "--font-bodonim",      bodyVar: "--font-epilogue" },
  { id: "arvointer",     label: "Arvo & Inter — Arvo + Inter",                 headingVar: "--font-arvo",         bodyVar: "--font-inter" },
  { id: "arvorubik",     label: "Arvo & Rubik — Arvo + Rubik",                 headingVar: "--font-arvo",         bodyVar: "--font-rubik" },
  { id: "alegreyaspace", label: "Alegreya & Space — Alegreya + Space Grotesk", headingVar: "--font-alegreya",     bodyVar: "--font-spacegrotesk" },
  { id: "alegreyajkt",   label: "Alegreya & Jakarta — Alegreya + Jakarta",     headingVar: "--font-alegreya",     bodyVar: "--font-jakarta" },
  { id: "ptsuite",       label: "PT Suite — PT Serif + Lato",                  headingVar: "--font-ptserif",      bodyVar: "--font-lato" },
  { id: "ptrubik",       label: "PT & Rubik — PT Serif + Rubik",               headingVar: "--font-ptserif",      bodyVar: "--font-rubik" },
  { id: "pttitillium",   label: "PT & Titillium — PT Serif + Titillium Web",   headingVar: "--font-ptserif",      bodyVar: "--font-titilliumweb" },
  { id: "vollkornrubik", label: "Vollkorn & Rubik — Vollkorn + Rubik",         headingVar: "--font-vollkorn",     bodyVar: "--font-rubik" },
  { id: "vollkornpop",   label: "Vollkorn & Poppins — Vollkorn + Poppins",     headingVar: "--font-vollkorn",     bodyVar: "--font-poppins" },
  { id: "philosopher",   label: "Philosopher — Philosopher + Quicksand",       headingVar: "--font-philosopher",  bodyVar: "--font-quicksand" },
  { id: "neutonubuntu",  label: "Neuton & Ubuntu — Neuton + Ubuntu",           headingVar: "--font-neuton",       bodyVar: "--font-ubuntu" },
  { id: "neutonfigure",  label: "Neuton & Figtree — Neuton + Figtree",         headingVar: "--font-neuton",       bodyVar: "--font-figtree" },
  { id: "gildaasap",     label: "Gilda & Asap — Gilda Display + Asap",         headingVar: "--font-gilda",        bodyVar: "--font-asap" },
  { id: "gildamanrope",  label: "Gilda & Manrope — Gilda Display + Manrope",   headingVar: "--font-gilda",        bodyVar: "--font-manrope" },
  { id: "oldstandard",   label: "Old Standard — Old Standard TT + Exo 2",      headingVar: "--font-oldstandard",  bodyVar: "--font-exo2" },
] as const;

export type FontOptionId = (typeof FONT_OPTIONS)[number]["id"];

/** CSS custom properties for the primary colour and its light/dark shades. */
export function primaryCssVars(hex: string): Record<string, string> {
  const rgb = (h: string) => hexToRgb(h).join(" ");
  return {
    "--color-primary": rgb(hex),
    "--color-primary-light": rgb(lighten(hex, 0.22)),
    "--color-primary-dark": rgb(darken(hex, 0.22)),
  };
}

/** CSS custom properties for a heading/body font pairing. */
export function fontCssVars(id: string): Record<string, string> {
  const opt = FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
  return {
    "--font-heading": `var(${opt.headingVar})`,
    "--font-body": `var(${opt.bodyVar})`,
  };
}
