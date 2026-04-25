import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 min-w-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
