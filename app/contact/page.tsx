"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Page header */}
      <section className="bg-forest py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Palestine and the Law
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-cream mb-4">
            Contact Us
          </h1>
          <div className="gold-divider mx-auto" />
          <p className="font-sans text-base text-cream/60 mt-6 max-w-xl mx-auto leading-relaxed">
            For enquiries about the book, permission requests, or any other
            matters relating to this work.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L1440 40L1440 0C1440 0 1200 30 720 20C240 10 0 0 0 0L0 40Z" fill="#f4f8fc" />
          </svg>
        </div>
      </section>

      {/* Contact form */}
      <section className="py-20 bg-parchment">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="bg-surface border border-cream-dark rounded-sm p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-forest mb-2">
                Message Sent
              </h2>
              <p className="font-sans text-base text-ink-muted">
                Thank you for reaching out. We will endeavour to respond to your
                enquiry as soon as possible.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", subject: "", message: "" });
                }}
                className="mt-6 btn-outline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="bg-surface border border-cream-dark rounded-sm shadow-sm p-8 md:p-12">
              <h2 className="font-serif text-2xl font-bold text-forest mb-2">
                Get in Touch
              </h2>
              <div className="gold-divider mb-8" />

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block font-sans text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2"
                    >
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="field"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-sans text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2"
                    >
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="field"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                      className="block font-sans text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2"
                  >
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="field bg-surface"
                  >
                    <option value="">Select a subject…</option>
                    <option value="general">General Enquiry</option>
                    <option value="permission">Permission / Reproduction Request</option>
                    <option value="academic">Academic / Research Enquiry</option>
                    <option value="media">Media / Press Enquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                      className="block font-sans text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2"
                  >
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    className="field resize-none"
                    placeholder="Please describe your enquiry…"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="font-sans text-xs text-ink-faint">
                    <span className="text-red-400">*</span> Required fields
                  </p>
                  <button type="submit" className="btn-primary">
                    Send Message →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Copyright note */}
          <div className="mt-10 p-6 bg-cream border border-cream-dark rounded-sm">
            <h3 className="font-serif text-base font-semibold text-forest mb-2">
              Copyright &amp; Permissions
            </h3>
            <p className="font-sans text-sm text-ink-muted leading-relaxed">
              No part of this website or any part of the book contained in it
              may be reproduced in any form or by any electronic or mechanical
              means, including information storage and retrieval systems, without
              permission in writing from the estate of the author, except by a
              reviewer who may quote brief passages in a review.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
