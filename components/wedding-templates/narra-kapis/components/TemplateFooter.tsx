"use client";

import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import { DISPLAY, SCRIPT, SERIF } from "../theme";
import { Banahaw } from "./Ornaments";
import { Written } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

/** Dusk over Mount Banahaw, the couple's names written once more across the evening sky. */
export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const link = "underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <footer style={{ background: `linear-gradient(180deg, #E9B985 0%, #C98A5A 38%, ${p.narra} 100%)`, color: p.capiz, textAlign: "center" }}>
      <div style={{ padding: "4.5rem 1.25rem 0" }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(18px, 5vw, 21px)", color: p.ink, margin: 0 }}>Hanggang sa muli,</p>
        <p style={{ fontFamily: SCRIPT, fontSize: "clamp(2.8rem, 13vw, 4rem)", lineHeight: 1.1, margin: "0.25rem 0 0" }}>
          <Written color={p.narraDeep} nib={p.capiz} inView duration={2.4}>
            {config.partner1Name} &amp; {config.partner2Name}
          </Written>
        </p>
      </div>
      <Banahaw far={`color-mix(in srgb, ${p.narra} 70%, #E9B985)`} near={p.narraDeep} style={{ marginTop: "-0.5rem" }} />
      <div style={{ background: p.narraDeep, padding: "0 1.25rem 2.5rem" }}>
        {date.dayMonthYear && (
          <p style={{ fontFamily: DISPLAY, fontSize: 13, letterSpacing: "0.26em", paddingLeft: "0.26em", textTransform: "uppercase", color: p.sand, margin: 0 }}>{date.dayMonthYear}</p>
        )}
        {hashtag && (
          <p style={{ fontFamily: DISPLAY, fontSize: 15, letterSpacing: "0.14em", color: p.brass, margin: "1.25rem 0 0" }}>{hashtag}</p>
        )}
        {contact && (
          <div style={{ fontFamily: SERIF, fontSize: 17, color: p.capiz, margin: "1.75rem 0 0" }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase", color: p.sand, margin: "0 0 0.4rem" }}>
              {contact.name ? `Mga tanong? Sumulat kay ${contact.name}` : "Mga tanong?"}
            </p>
            <p style={{ margin: 0 }}>
              {contact.emailHref && <a href={contact.emailHref} className={link} style={{ color: p.capiz, outlineColor: p.brass }}>{contact.email}</a>}
              {contact.emailHref && contact.phoneHref && <span aria-hidden> · </span>}
              {contact.phoneHref && <a href={contact.phoneHref} className={link} style={{ color: p.capiz, outlineColor: p.brass }}>{contact.phone}</a>}
            </p>
          </div>
        )}
        {socials.length > 0 && (
          <ul aria-label="Social links" className="flex flex-wrap justify-center gap-x-6 gap-y-2" style={{ listStyle: "none", padding: 0, margin: "1.5rem 0 0" }}>
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={link} style={{ fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: p.capiz, outlineColor: p.brass }}>
                  {s.label}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <InvitationDownloadLink
          config={config}
          className="mt-6 inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ minHeight: 48, padding: "0 1.5rem", border: `1px solid ${p.brass}`, color: p.capiz, fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", outlineColor: p.brass }}
        />
        {showBranding && (
          <p style={{ fontFamily: SERIF, fontSize: 16, color: "rgba(247,239,225,.78)", margin: "1.75rem 0 0" }}>
            Created with{" "}
            <Link href="/" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ color: p.capiz, outlineColor: p.brass }}>
              Selah Vie
            </Link>{" "}
            · Narra &amp; Kapis
          </p>
        )}
      </div>
    </footer>
  );
}
