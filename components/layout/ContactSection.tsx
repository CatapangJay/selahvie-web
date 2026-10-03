"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import { InputField, TextareaField } from "@/components/ui/InputField";
import { CONTACT_EMAIL } from "@/lib/constants";

// The global `* { border-color: transparent }` reset outranks layered utilities,
// so field borders need `!important` to show.
const FIELD_BORDER = "border-[var(--color-outline)]! focus:border-[var(--color-primary)]!";

/**
 * Landing-page contact block. Sits on the tinted band that the footer's
 * curved edge rises into. There's no backend yet, so submitting composes the
 * message in the visitor's own mail app (mailto:) — nothing is lost or faked.
 */
export default function ContactSection() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const date = String(data.get("date") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const details = [`Name: ${name}`, `Email: ${email}`];
    if (date) details.push(`Wedding date: ${date}`);
    const body = `${details.join("\n")}\n\n${message}`;
    const subject = `Inquiry from ${name}`;

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <section
      id="contact"
      className="scroll-mt-20"
      style={{
        background: "var(--color-surface-container-low)",
        paddingTop: "clamp(4rem, 8vw, 7rem)",
        paddingBottom: "clamp(1.5rem, 3vw, 2.5rem)",
      }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-12 lg:gap-16">
        <Reveal from="left" className="lg:col-span-5">
          <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>Contact us</p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "0.02em",
              color: "var(--color-on-surface)",
              textWrap: "balance",
            }}
          >
            Let&rsquo;s talk about <em style={{ fontStyle: "italic", color: "var(--color-primary)" }}>your day</em>
          </h2>
          <p className="mt-5 max-w-sm text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
            Questions about a template, personalizing your site, or managing RSVPs? Send us a note and we&rsquo;ll help
            you find the right fit.
          </p>

          <div className="mt-10 flex flex-col gap-6">
            <a href={`mailto:${CONTACT_EMAIL}`} className="group inline-flex items-center gap-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)" }}
              >
                <Mail size={16} strokeWidth={1.5} style={{ color: "var(--color-primary)" }} />
              </span>
              <span className="flex flex-col">
                <span className="label-luxury" style={{ color: "var(--color-on-surface-variant)" }}>Email us</span>
                <span className="text-sm transition-colors group-hover:text-[var(--color-primary)]" style={{ color: "var(--color-on-surface)" }}>
                  {CONTACT_EMAIL}
                </span>
              </span>
            </a>
            <Link
              href="/templates"
              className="label-luxury inline-flex items-center gap-2 self-start transition-opacity hover:opacity-70"
              style={{ color: "var(--color-primary)", borderBottom: "1px solid var(--color-outline-variant)", paddingBottom: "0.35rem" }}
            >
              Or browse the templates first <ArrowRight size={13} />
            </Link>
          </div>
        </Reveal>

        <Reveal index={1} className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            <InputField id="contact-name" name="name" label="Your names" autoComplete="name" required placeholder="Anna & Miguel" className={FIELD_BORDER} />
            <InputField id="contact-email" name="email" type="email" label="Email" autoComplete="email" required placeholder="you@example.com" className={FIELD_BORDER} />
            <div className="sm:col-span-2">
              <InputField id="contact-date" name="date" type="date" label="Wedding date (optional)" className={FIELD_BORDER} />
            </div>
            <div className="sm:col-span-2">
              <TextareaField id="contact-message" name="message" label="Message" required placeholder="Tell us a little about your wedding and what you need." className={FIELD_BORDER} />
            </div>
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p role="status" className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                {sent ? "Your email app should open with your message ready to send." : "Opens in your email app, ready to send."}
              </p>
              <ButtonPrimary type="submit" size="lg">Send message</ButtonPrimary>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
