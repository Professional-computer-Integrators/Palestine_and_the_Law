"use client";

import Link from "next/link";
import EditableText, { useEditableText } from "@/components/EditableText";

const footerLinks = [
  { href: "/", label: "Home", id: "footer.link.home" },
  { href: "/contents", label: "Overview of Chapters", id: "footer.link.contents" },
  { href: "/dedication", label: "Dedication & Acknowledgements", id: "footer.link.dedication" },
  { href: "/updates", label: "Updates", id: "footer.link.updates" },
  { href: "/contact", label: "Contact", id: "footer.link.contact" },
];

function FooterLinkLabel({ id, defaultText }: { id: string; defaultText: string }) {
  const { text, color } = useEditableText(id, defaultText);
  return <span style={color ? { color } : undefined}>{text}</span>;
}

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-cream/80">
      <div className="h-1 w-full bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <EditableText
              id="footer.brand.title"
              defaultText="Palestine and the Law"
              tag="h3"
              className="font-serif text-lg font-bold text-cream mb-2"
              label="Footer brand title"
            />
            <EditableText
              id="footer.brand.kicker"
              defaultText="Guidelines for Resolution"
              tag="p"
              className="font-sans text-xs tracking-widest text-gold/80 uppercase mb-4"
              label="Footer brand kicker"
            />
            <EditableText
              id="footer.brand.description"
              defaultText="A comprehensive legal study of the Arab-Israel conflict by Professor Musa E. Mazzawi."
              tag="p"
              className="font-sans text-sm leading-relaxed text-cream/60"
              label="Footer brand description"
            />
          </div>

          {/* Navigation */}
          <div>
            <EditableText
              id="footer.nav.heading"
              defaultText="Pages"
              tag="h4"
              className="font-serif text-base font-semibold text-cream mb-4"
              label="Footer nav heading"
            />
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-cream/60 hover:text-gold transition-colors duration-200"
                  >
                    <FooterLinkLabel id={link.id} defaultText={link.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <div>
            <EditableText
              id="footer.copyright.heading"
              defaultText="Copyright Notice"
              tag="h4"
              className="font-serif text-base font-semibold text-cream mb-4"
              label="Footer copyright heading"
            />
            <EditableText
              id="footer.copyright.body"
              defaultText="© Musa Mazzawi, 1997. All rights reserved. No part of this website or any part of the book may be reproduced in any form without permission in writing from the estate of the author."
              tag="p"
              className="font-sans text-sm leading-relaxed text-cream/60"
              label="Footer copyright body"
            />
            <EditableText
              id="footer.copyright.isbn"
              defaultText="ISBN: 0 86372 222 9"
              tag="p"
              className="font-sans text-xs text-cream/40 mt-4"
              label="Footer ISBN"
            />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <EditableText
            id="footer.bottom"
            defaultText="First published 1997 · British Library Cataloguing-in-Publication Data available"
            tag="p"
            className="font-sans text-xs text-cream/40"
            label="Footer bottom line"
          />
        </div>
      </div>
    </footer>
  );
}
