"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import AdminButton from "@/components/AdminButton";
import SearchBar from "@/components/SearchBar";
import EditableText, { useEditableText } from "@/components/EditableText";

const navLinks = [
  { href: "/", label: "Home", id: "nav.link.home" },
  { href: "/contents", label: "Overview of Chapters", id: "nav.link.contents" },
  { href: "/dedication", label: "Dedication & Acknowledgements", id: "nav.link.dedication" },
  { href: "/insights", label: "Insights", id: "nav.link.insights" },
  { href: "/contact", label: "Contact", id: "nav.link.contact" },
];

function NavLinkLabel({ id, defaultText }: { id: string; defaultText: string }) {
  const { text, color } = useEditableText(id, defaultText);
  return <span style={color ? { color } : undefined}>{text}</span>;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Measure ONLY the sticky nav row's height so other components (e.g. the
  // chapter sidebar) can sit immediately beneath it via --navbar-height.
  const navRef = useRef<HTMLDivElement>(null);

  // Check admin auth status for showing the Statistics link
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.ok ? r.json() : { isAdmin: false })
      .then((data: { isAdmin?: boolean }) => setIsAdmin(Boolean(data.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  useEffect(() => {
    const update = () => {
      if (navRef.current) {
        const h = navRef.current.offsetHeight;
        document.documentElement.style.setProperty("--navbar-height", `${h}px`);
      }
    };
    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <>
      <header className="bg-forest text-cream shadow-lg">
        {/* Gold accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

        {/* Title row: plain in-flow element. As the user scrolls, it
            scrolls off the top of the page natively (no JS, no jank). */}
        <div className="w-full py-4 px-4 sm:px-6">
          <div className="relative text-center">
            {/* Admin button - top right on sm+ only */}
            <div className="hidden sm:block absolute top-1/2 right-0 -translate-y-1/2">
              <AdminButton />
            </div>

            <Link href="/" className="group block">
              <div
                className="font-serif font-bold text-cream leading-none tracking-wide whitespace-nowrap"
                style={{ fontSize: "clamp(2.2rem, 7.2vw, 9rem)" }}
              >
                <EditableText
                  id="site.title.first"
                  defaultText="PALESTINE"
                  tag="span"
                  className=""
                  label="Site title (first word)"
                />{' '}
                <span
                  className="font-normal text-cream/70"
                  style={{ fontSize: "clamp(1rem, 3.2vw, 4rem)" }}
                >
                  <EditableText
                    id="site.title.middle"
                    defaultText="and the"
                    tag="span"
                    className=""
                    label="Site title (middle words)"
                  />
                </span>{' '}
                <EditableText
                  id="site.title.last"
                  defaultText="LAW"
                  tag="span"
                  className=""
                  label="Site title (last word)"
                />
              </div>
              <EditableText
                id="site.subtitle"
                defaultText="Guidelines for The Resolution of the Arab-Israel Conflict"
                tag="div"
                className="font-sans tracking-[0.2em] text-cream/80 uppercase mt-1"
                label="Site subtitle (under title)"
              />
            </Link>
          </div>

          {/* Admin button - mobile only, below title */}
          <div className="flex justify-end mt-2 sm:hidden">
            <AdminButton />
          </div>
        </div>
      </header>

      {/* The ONLY sticky element. Pinned to the top once the user scrolls
          past the title. Native browser sticky = perfectly smooth. */}
      <div
        ref={navRef}
        className="hidden md:block sticky top-0 z-50 border-y border-white/10 bg-forest-dark text-cream shadow-md"
      >
        <nav className="flex justify-center items-center w-full gap-3 px-4">
          <div className="flex flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-5 py-3 font-sans text-sm tracking-wide text-cream transition-colors duration-200
                  after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-full after:-translate-x-1/2
                  after:scale-x-0 after:bg-cream after:transition-transform after:duration-200
                  hover:after:scale-x-100 ${
                  pathname === link.href
                    ? "font-semibold after:scale-x-100"
                    : ""
                }`}
              >
                <NavLinkLabel id={link.id} defaultText={link.label} />
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`relative px-5 py-3 font-sans text-sm tracking-wide text-cream transition-colors duration-200
                  after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-full after:-translate-x-1/2
                  after:scale-x-0 after:bg-cream after:transition-transform after:duration-200
                  hover:after:scale-x-100 ${
                  pathname.startsWith("/admin")
                    ? "font-semibold after:scale-x-100"
                    : ""
                }`}
              >
                Statistics
              </Link>
            )}
          </div>
          <div className="py-2 flex-shrink-0">
            <SearchBar variant="desktop" />
          </div>
        </nav>
      </div>

      {/* Mobile burger - fixed floating button */}
      <div className="md:hidden fixed top-0 left-0 z-50">
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

        {mobileOpen && (
          <div className="bg-forest-dark/60 backdrop-blur-sm border-t border-white/10 shadow-lg">
            <div className="px-4 py-3 border-b border-white/10">
              <SearchBar variant="mobile" />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-6 py-3 font-sans text-sm text-cream border-b border-white/10 transition-colors duration-200 ${
                  pathname === link.href
                    ? "font-semibold"
                    : "hover:bg-white/10"
                }`}
              >
                <NavLinkLabel id={link.id} defaultText={link.label} />
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`block px-6 py-3 font-sans text-sm text-cream border-b border-white/10 transition-colors duration-200 ${
                  pathname.startsWith("/admin")
                    ? "font-semibold"
                    : "hover:bg-white/10"
                }`}
              >
                Statistics
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
