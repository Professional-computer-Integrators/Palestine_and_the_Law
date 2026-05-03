import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?" +
  "family=Playfair+Display:wght@400;500;600;700;800" +
  "&family=Inter:wght@300;400;500;600" +
  "&family=Merriweather:wght@300;400;700" +
  "&family=Roboto:wght@300;400;500;700" +
  "&family=Lora:wght@400;500;600;700" +
  "&family=Open+Sans:wght@300;400;600" +
  "&family=Crimson+Text:wght@400;600" +
  "&family=Source+Sans+3:wght@300;400;600" +
  "&family=EB+Garamond:wght@400;500;600;700" +
  "&family=Raleway:wght@300;400;500;600" +
  "&family=Cormorant+Garamond:wght@400;500;600;700" +
  "&family=Nunito:wght@300;400;600;700" +
  "&family=Libre+Baskerville:wght@400;700" +
  "&family=Libre+Franklin:wght@300;400;600" +
  "&family=Spectral:wght@400;500;600;700" +
  "&family=Karla:wght@300;400;500;600" +
  "&family=Cardo:wght@400;700" +
  "&family=Cabin:wght@400;500;600;700" +
  "&family=Mulish:wght@300;400;500;600" +
  "&family=Domine:wght@400;500;600;700" +
  "&family=Fira+Sans:wght@300;400;500;600" +
  "&family=Work+Sans:wght@300;400;500;600" +
  "&family=DM+Sans:wght@300;400;500;600" +
  "&family=Josefin+Sans:wght@300;400;600;700" +
  "&family=Jost:wght@300;400;500;600" +
  "&family=Outfit:wght@300;400;500;600" +
  "&family=Manrope:wght@300;400;500;600" +
  "&family=Barlow:wght@300;400;500;600" +
  "&family=IBM+Plex+Sans:wght@300;400;500;600" +
  "&family=Syne:wght@400;500;600;700" +
  "&family=Space+Grotesk:wght@300;400;500;600" +
  "&family=Tenor+Sans:wght@400" +
  "&family=Plus+Jakarta+Sans:wght@300;400;500;600" +
  "&family=Zilla+Slab:wght@400;500;600;700" +
  "&family=PT+Sans:wght@400;700" +
  "&family=Fraunces:wght@400;500;600;700" +
  "&family=Nunito+Sans:wght@300;400;600" +
  "&family=Roboto+Slab:wght@300;400;600;700" +
  "&family=Roboto+Mono:wght@300;400;500" +
  "&family=Poppins:wght@300;400;500;600;700" +
  "&family=Montserrat:wght@300;400;500;600;700" +
  "&family=Urbanist:wght@300;400;500;600;700" +
  "&family=Lexend:wght@300;400;500;600;700" +
  "&family=Figtree:wght@300;400;500;600;700" +
  "&family=Hahmlet:wght@300;400;500;600;700" +
  "&family=M+PLUS+1:wght@300;400;500;600;700" +
  "&family=NTR" +
  "&family=Red+Hat+Display:wght@300;400;500;600;700" +
  "&family=Epilogue:wght@300;400;500;600;700" +
  "&family=Cinzel:wght@400;500;600;700" +
  "&family=Abril+Fatface" +
  "&family=Bodoni+Moda:wght@400;500;600;700" +
  "&family=Arvo:wght@400;700" +
  "&family=Alegreya:wght@400;500;600;700" +
  "&family=PT+Serif:wght@400;700" +
  "&family=Vollkorn:wght@400;500;600;700" +
  "&family=Philosopher:wght@400;700" +
  "&family=Neuton:wght@400;700" +
  "&family=Gilda+Display" +
  "&family=Old+Standard+TT:wght@400;700" +
  "&family=Lato:wght@300;400;700" +
  "&family=Ubuntu:wght@300;400;500;700" +
  "&family=Quicksand:wght@300;400;500;600;700" +
  "&family=Rubik:wght@300;400;500;600;700" +
  "&family=Titillium+Web:wght@300;400;600;700" +
  "&family=Asap:wght@300;400;500;600" +
  "&family=Exo+2:wght@300;400;500;600;700" +
  "&display=swap";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        {/* ── Global background: sand image + dark overlay + light sweep ── */}
        <div
          className="sand-orbit fixed -z-20"
          style={{
            inset: "-8%",
            backgroundImage: `url("/hero-bg.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.45,
          }}
        />
        <div className="fixed inset-0 -z-20 bg-forest/80" />
        <div className="hero-light-sweep fixed" style={{ zIndex: -10 }} />
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 min-w-0">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
