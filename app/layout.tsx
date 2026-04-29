import type { Metadata } from "next";
import {
  Playfair_Display,
  Inter,
  Merriweather,
  Roboto,
  Lora,
  Open_Sans,
  Crimson_Text,
  Source_Sans_3,
  EB_Garamond,
  Raleway,
  Cormorant_Garamond,
  Nunito,
  Libre_Baskerville,
  Libre_Franklin,
  Spectral,
  Karla,
  Cardo,
  Cabin,
  Mulish,
  Domine,
  Fira_Sans,
  Work_Sans,
  DM_Sans,
  Josefin_Sans,
  Jost,
  Outfit,
  Manrope,
  Barlow,
  IBM_Plex_Sans,
  Syne,
  Space_Grotesk,
  Tenor_Sans,
  Plus_Jakarta_Sans,
  Zilla_Slab,
  PT_Sans,
  Fraunces,
  Nunito_Sans,
  Roboto_Slab,
  Roboto_Mono,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";

// ── Existing 5 ────────────────────────────────────────────────────────────────
const playfair     = Playfair_Display({ variable: "--font-playfair",    subsets: ["latin"], weight: ["400","500","600","700","800"] });
const inter        = Inter(            { variable: "--font-inter",       subsets: ["latin"], weight: ["300","400","500","600"] });
const merriweather = Merriweather(     { variable: "--font-merriweather",subsets: ["latin"], weight: ["300","400","700"] });
const roboto       = Roboto(           { variable: "--font-roboto",      subsets: ["latin"], weight: ["300","400","500","700"] });
const lora         = Lora(             { variable: "--font-lora",        subsets: ["latin"], weight: ["400","500","600","700"] });
const openSans     = Open_Sans(        { variable: "--font-opensans",    subsets: ["latin"], weight: ["300","400","600"] });
const crimsonText  = Crimson_Text(     { variable: "--font-crimson",     subsets: ["latin"], weight: ["400","600"] });
const sourceSans   = Source_Sans_3(    { variable: "--font-sourcesans",  subsets: ["latin"], weight: ["300","400","600"] });
const ebGaramond   = EB_Garamond(      { variable: "--font-garamond",    subsets: ["latin"], weight: ["400","500","600","700"] });
const raleway      = Raleway(          { variable: "--font-raleway",     subsets: ["latin"], weight: ["300","400","500","600"] });

// ── New 15 ────────────────────────────────────────────────────────────────────
const cormorant    = Cormorant_Garamond({ variable: "--font-cormorant",   subsets: ["latin"], weight: ["400","500","600","700"] });
const nunito       = Nunito(            { variable: "--font-nunito",      subsets: ["latin"], weight: ["300","400","600","700"] });
const baskerville  = Libre_Baskerville( { variable: "--font-baskerville", subsets: ["latin"], weight: ["400","700"] });
const franklin     = Libre_Franklin(    { variable: "--font-franklin",    subsets: ["latin"], weight: ["300","400","600"] });
const spectral     = Spectral(          { variable: "--font-spectral",    subsets: ["latin"], weight: ["400","500","600","700"] });
const karla        = Karla(             { variable: "--font-karla",       subsets: ["latin"], weight: ["300","400","500","600"] });
const cardo        = Cardo(             { variable: "--font-cardo",       subsets: ["latin"], weight: ["400","700"] });
const cabin        = Cabin(             { variable: "--font-cabin",       subsets: ["latin"], weight: ["400","500","600","700"] });
const mulish       = Mulish(            { variable: "--font-mulish",      subsets: ["latin"], weight: ["300","400","500","600"] });
const domine       = Domine(            { variable: "--font-domine",      subsets: ["latin"], weight: ["400","500","600","700"] });
const firaSans     = Fira_Sans(         { variable: "--font-firasans",    subsets: ["latin"], weight: ["300","400","500","600"] });
const workSans     = Work_Sans(         { variable: "--font-worksans",    subsets: ["latin"], weight: ["300","400","500","600"] });
const dmSans       = DM_Sans(           { variable: "--font-dmsans",      subsets: ["latin"], weight: ["300","400","500","600"] });
const josefin      = Josefin_Sans(      { variable: "--font-josefin",     subsets: ["latin"], weight: ["300","400","600","700"] });
const jost         = Jost(              { variable: "--font-jost",        subsets: ["latin"], weight: ["300","400","500","600"] });
const outfit       = Outfit(            { variable: "--font-outfit",      subsets: ["latin"], weight: ["300","400","500","600"] });
const manrope      = Manrope(           { variable: "--font-manrope",     subsets: ["latin"], weight: ["300","400","500","600"] });
const barlow       = Barlow(            { variable: "--font-barlow",      subsets: ["latin"], weight: ["300","400","500","600"] });
const ibmPlex      = IBM_Plex_Sans(     { variable: "--font-ibmplexsans", subsets: ["latin"], weight: ["300","400","500","600"] });
const syne         = Syne(              { variable: "--font-syne",        subsets: ["latin"], weight: ["400","500","600","700"] });
const spaceGrotesk = Space_Grotesk(     { variable: "--font-spacegrotesk",subsets: ["latin"], weight: ["300","400","500","600"] });
const tenorSans    = Tenor_Sans(        { variable: "--font-tenorsans",   subsets: ["latin"], weight: ["400"] });
const jakarta      = Plus_Jakarta_Sans( { variable: "--font-jakarta",     subsets: ["latin"], weight: ["300","400","500","600"] });
const zillaSlab    = Zilla_Slab(        { variable: "--font-zillaslab",   subsets: ["latin"], weight: ["400","500","600","700"] });
const ptSans       = PT_Sans(           { variable: "--font-ptsans",      subsets: ["latin"], weight: ["400","700"] });
const fraunces     = Fraunces(          { variable: "--font-fraunces",    subsets: ["latin"], weight: ["400","500","600","700"] });
const nunitoSans   = Nunito_Sans(       { variable: "--font-nunitosans",  subsets: ["latin"], weight: ["300","400","600"] });
const robotoSlab   = Roboto_Slab(       { variable: "--font-robotoslab",  subsets: ["latin"], weight: ["300","400","600","700"] });
const robotoMono   = Roboto_Mono(       { variable: "--font-robotomono",  subsets: ["latin"], weight: ["300","400","500"] });

const allFontVars = [
  playfair.variable, inter.variable, merriweather.variable, roboto.variable,
  lora.variable, openSans.variable, crimsonText.variable, sourceSans.variable,
  ebGaramond.variable, raleway.variable,
  cormorant.variable, nunito.variable, baskerville.variable, franklin.variable,
  spectral.variable, karla.variable, cardo.variable, cabin.variable,
  mulish.variable, domine.variable, firaSans.variable,
  workSans.variable, dmSans.variable, josefin.variable, jost.variable,
  outfit.variable, manrope.variable, barlow.variable, ibmPlex.variable,
  syne.variable, spaceGrotesk.variable, tenorSans.variable, jakarta.variable,
  zillaSlab.variable, ptSans.variable, fraunces.variable, nunitoSans.variable,
  robotoSlab.variable, robotoMono.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Palestine and the Law | Guidelines for Resolution",
  description:
    "A comprehensive legal study of the Arab-Israel conflict and the Palestinian question during the 20th century, by Professor Musa Mazzawi.",
  keywords: [
    "Palestine",
    "international law",
    "Israel",
    "UN Partition Resolution",
    "Musa Mazzawi",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={allFontVars}>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 min-w-0">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

