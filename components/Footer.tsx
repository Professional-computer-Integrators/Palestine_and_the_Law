import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-cream/80">
      <div className="h-1 w-full bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-lg font-bold text-cream mb-2">
              Palestine and the Law
            </h3>
            <p className="font-sans text-xs tracking-widest text-gold/80 uppercase mb-4">
              Guidelines for Resolution
            </p>
            <p className="font-sans text-sm leading-relaxed text-cream/60">
              A comprehensive legal study of the Arab-Israel conflict by
              Professor Musa E. Mazzawi.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-base font-semibold text-cream mb-4">
              Pages
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/contents", label: "Overview of Chapters" },
                { href: "/dedication", label: "Dedication & Acknowledgements" },
                { href: "/updates", label: "Updates" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-cream/60 hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <div>
            <h4 className="font-serif text-base font-semibold text-cream mb-4">
              Copyright Notice
            </h4>
            <p className="font-sans text-sm leading-relaxed text-cream/60">
              © Musa Mazzawi, 1997. All rights reserved. No part of this
              website or any part of the book may be reproduced in any form
              without permission in writing from the estate of the author.
            </p>
            <p className="font-sans text-xs text-cream/40 mt-4">
              ISBN: 0 86372 222 9
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="font-sans text-xs text-cream/40">
            First published 1997 · British Library Cataloguing-in-Publication
            Data available
          </p>
        </div>
      </div>
    </footer>
  );
}
