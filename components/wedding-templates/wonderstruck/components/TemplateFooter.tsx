"use client";

import { motion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";

interface Props {
  config: WeddingConfig;
  accent: string;
  gold: string;
  weddingDateFormatted: string;
  show: boolean;
}

export default function TemplateFooter({ config, accent, gold, weddingDateFormatted, show }: Props) {
  const hasNames = config.partner1Name && config.partner2Name;
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const linkClass = "uppercase text-xs underline-offset-4 hover:underline";
  const linkStyle = { color: gold, letterSpacing: "0.16em", fontFamily: "var(--font-sans)" };

  return (
    <footer
      className="relative py-16 px-6 text-center overflow-hidden"
      style={{ background: "#080910", borderTop: `1px solid ${accent}15` }}
    >
      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-32"
        style={{ background: `linear-gradient(to bottom, ${accent}08, transparent)` }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" as const }}
        className="relative"
      >
        {/* Rotating star ornament */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-5"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill={gold} aria-hidden>
            <path d="M11 0 L13 8 L22 11 L13 14 L11 22 L9 14 L0 11 L9 8 Z" style={{ filter: `drop-shadow(0 0 6px ${gold}80)` }} />
          </svg>
        </motion.div>

        <h2
          className="block"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.5rem, 4vw, 2.4rem)",
            color: "#f0ecf8",
            letterSpacing: "-0.01em",
          }}
        >
          {hasNames ? `${config.partner1Name} & ${config.partner2Name}` : "Forever Begins"}
        </h2>

        {weddingDateFormatted && (
          <p
            className="mt-2 text-sm tracking-widest uppercase"
            style={{ color: `${accent}b0`, letterSpacing: "0.16em", fontFamily: "var(--font-sans)" }}
          >
            {weddingDateFormatted}
          </p>
        )}

        {hashtag && (
          <p
            className="mt-5"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: gold, textShadow: `0 0 16px ${gold}50` }}
          >
            {hashtag}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mt-6 mb-4">
          <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${accent}40)` }} />
          <div className="w-1 h-1 rounded-full" style={{ background: `${accent}60` }} />
          <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${accent}40)` }} />
        </div>

        {contact && (
          <p
            className="mb-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm"
            style={{ color: `${accent}cc`, fontFamily: "var(--font-serif)" }}
          >
            {contact.name && <span>Questions? Reach {contact.name}</span>}
            {contact.emailHref && (
              <a href={contact.emailHref} className={linkClass} style={linkStyle}>
                {contact.email}
              </a>
            )}
            {contact.phoneHref && (
              <a href={contact.phoneHref} className={linkClass} style={linkStyle}>
                {contact.phone}
              </a>
            )}
          </p>
        )}

        {socials.length > 0 && (
          <ul aria-label="Follow along" className="mb-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkClass} style={linkStyle}>
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <InvitationDownloadLink
          config={config}
          className="mb-5 inline-block rounded-xl px-6 py-2.5 text-xs uppercase transition-opacity hover:opacity-80"
          style={{
            ...linkStyle,
            border: `1px solid ${gold}60`,
            background: `linear-gradient(135deg, ${accent}15, ${gold}15)`,
            letterSpacing: "0.18em",
          }}
        />

        {show && (
          <p className="text-xs" style={{ color: `${accent}80`, letterSpacing: "0.12em" }}>
            Created with{" "}
            <span style={{ color: gold }}>Selah Vie</span>
          </p>
        )}
      </motion.div>
    </footer>
  );
}
