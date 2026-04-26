"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/contents", label: "Overview of Chapters" },
  { href: "/dedication", label: "Dedication & Acknowledgements" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(80);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const s = window.scrollY > 56;
      setScrolled(s);
      document.body.classList.toggle("sidebar-open", s);
      // Re-measure header height after nav bar collapses/expands (300ms transition)
      setTimeout(() => {
        if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
      }, 310);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("sidebar-open");
    };
  }, []);

  return (
    <>
      {/* ── STICKY WRAPPER (title bar only) ── */}
      <div className="sticky top-0 z-50" ref={headerRef}>
      <header className="bg-forest text-cream shadow-lg">
        <div className="h-1 w-full bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

        {/* Title row */}
        <div className="w-full py-4 px-4 sm:px-6 text-center">
          <Link href="/" className="group block">
            <div
              className="font-serif font-bold text-cream group-hover:text-gold transition-colors duration-200 leading-none tracking-wide whitespace-nowrap"
              style={{ fontSize: "clamp(2.2rem, 7.2vw, 9rem)" }}
            >
              PALESTINE <span className="font-normal text-cream/70 group-hover:text-gold/70" style={{ fontSize: "clamp(1rem, 3.2vw, 4rem)" }}>and the</span> LAW
            </div>
            <div className="font-sans tracking-[0.2em] text-gold/80 uppercase mt-1" style={{ fontSize: "clamp(0.6rem, 1.1vw, 1.1rem)" }}>
              Guidelines for Resolution of the Arab-Israel Conflict
            </div>
          </Link>
        </div>

        {/* ── HORIZONTAL NAV BAR (below title, hides on scroll) ── */}
        <div
          className={`hidden md:block border-t border-white/10 bg-forest-dark overflow-hidden transition-all duration-300 ${
            scrolled ? "max-h-0 opacity-0" : "max-h-16 opacity-100"
          }`}
        >
          <nav className="flex justify-center w-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-5 py-3 font-sans text-sm tracking-wide transition-colors duration-200
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left
                  after:scale-x-0 after:bg-black after:transition-transform after:duration-200
                  hover:after:scale-x-100 ${
                  pathname === link.href
                    ? "text-gold font-semibold after:scale-x-100 after:bg-gold"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

      </header>

      </div>{/* end sticky wrapper */}

      {/* ── MOBILE BURGER — fixed floating button ── */}
      <div className="md:hidden fixed left-0 z-50" style={{ top: `${headerHeight}px` }}>
        <div className="w-fit bg-transparent rounded-br-md">
          <button
            className="p-3 focus:outline-none focus:ring-2 focus:ring-gold"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <span className="block w-6 h-0.5 bg-black mb-1.5" />
            <span className="block w-6 h-0.5 bg-black mb-1.5" />
            <span className="block w-6 h-0.5 bg-black" />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="bg-forest-dark/60 backdrop-blur-sm border-t border-white/10 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-6 py-3 font-sans text-sm border-b border-white/10 transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-gold font-semibold"
                    : "text-cream/80 hover:text-cream hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── FIXED LEFT SIDEBAR (slides in when scrolled) ─────── */}
      <aside
        className={`hidden md:flex fixed left-0 z-40 flex-col bg-forest shadow-2xl border-r border-white/10 transition-transform duration-300 ${
          scrolled ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: `${headerHeight}px`, width: "200px", height: `calc(100vh - ${headerHeight}px)` }}
      >
        <div className="h-0.5 w-full bg-gradient-to-r from-gold to-transparent" />
        <nav className="flex flex-col py-2 flex-1 overflow-y-auto">
          <p className="px-4 pt-4 pb-2 font-sans text-[9px] tracking-[0.25em] uppercase text-gold/60">
            Navigation
          </p>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center px-4 py-3 font-sans text-sm transition-colors duration-200 border-b border-white/5 group ${
                pathname === link.href
                  ? "text-gold font-semibold bg-white/10"
                  : "text-cream/70 hover:text-cream hover:bg-white/5"
              }`}
            >
              <span
                className={`absolute left-0 top-0 h-full w-0.5 bg-gold transition-transform duration-200 origin-top ${
                  pathname === link.href
                    ? "scale-y-100"
                    : "scale-y-0 group-hover:scale-y-100"
                }`}
              />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <p className="font-sans text-[9px] text-cream/30 leading-relaxed">
            Palestine and the Law
            <br />© Musa Mazzawi, 1997
          </p>
        </div>
      </aside>
    </>
  );
}
