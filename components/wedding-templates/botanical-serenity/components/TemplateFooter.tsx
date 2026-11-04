"use client";

import { motion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import BotanicalOrnament from "./BotanicalOrnament";

interface Props {
  config: WeddingConfig;
  green: string;
  floral: string;
  textDeep: string;
}

export default function TemplateFooter({ config, green, floral, textDeep }: Props) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const linkStyle = { color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.3)" };

  return (
    <footer
      className="py-20 text-center"
      style={{ background: textDeep }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        className="flex flex-col items-center gap-6"
      >
        <BotanicalOrnament
          green={green}
          floral={floral}
          width={50}
          height={90}
          animationDelay={0.3}
        />

        <p
          className="text-2xl font-light italic"
          style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.02em" }}
        >
          {config.partner1Name} &amp; {config.partner2Name}
        </p>

        <p
          className="text-xs tracking-[0.22em] uppercase"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {config.weddingDate}
        </p>

        {hashtag && (
          <p className="text-lg font-light italic" style={{ color: "rgba(255,255,255,0.8)", letterSpacing: "0.02em" }}>
            {hashtag}
          </p>
        )}

        {contact && (
          <address className="not-italic flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-sm font-light" style={{ color: "rgba(255,255,255,0.7)" }}>
            {contact.name && <span>{contact.name}</span>}
            {contact.emailHref && <a href={contact.emailHref} className="py-2" style={linkStyle}>{contact.email}</a>}
            {contact.phoneHref && <a href={contact.phoneHref} className="py-2" style={linkStyle}>{contact.phone}</a>}
          </address>
        )}

        {socials.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-[11px] tracking-[0.2em] uppercase" aria-label="Follow along">
            {socials.map((l) => (
              <li key={l.id}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-block py-2" style={linkStyle}>{l.label}</a>
              </li>
            ))}
          </ul>
        )}

        <InvitationDownloadLink
          config={config}
          className="inline-block px-9 py-3.5 text-[11px] tracking-[0.18em] uppercase"
          style={{ border: "1px solid rgba(255,255,255,0.5)", color: "rgba(255,255,255,0.9)", borderRadius: "2px" }}
        />

        <div
          style={{ width: "1px", height: "40px", background: "rgba(255,255,255,0.15)", margin: "4px auto 0" }}
        />

        <p
          className="text-[10px] tracking-widest uppercase"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Created with Selah Vie
        </p>
      </motion.div>
    </footer>
  );
}
