import Link from "next/link";
import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, SANS } from "../theme";
import { Sprig } from "./Specimens";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

/** The back board of the folio: olive ink, the names once more, the collector's date, and who to ask. */
export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const soft = `color-mix(in srgb, ${p.sheet} 72%, transparent)`;
  const link: CSSProperties = { color: p.sheet, textDecoration: "underline", textUnderlineOffset: 4, textDecorationColor: `color-mix(in srgb, ${p.sheet} 40%, transparent)`, outlineColor: p.sheet };
  const small: CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: soft };

  return (
    <footer style={{ position: "relative", overflow: "hidden", background: p.inkDeep, color: p.sheet, padding: "4.5rem clamp(1.25rem, 6cqw, 2rem) 2.5rem" }}>
      <Sprig which={1} width="52cqw" rotate={200} opacity={0.32} style={{ right: "-14%", top: "-6%", maxWidth: 300, filter: "grayscale(.3) brightness(1.6)" }} />
      <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
        <p style={{ ...small, margin: 0 }}>With love and thanks</p>
        <p style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(2.4rem, 12cqw, 4rem)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: "0.9rem 0 0" }}>
          {config.partner1Name} <em style={{ color: `color-mix(in srgb, ${p.rust} 70%, #F2C9AE)` }}>&amp;</em> {config.partner2Name}
        </p>
        {date.collected && <p style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.14em", color: soft, margin: "1rem 0 0" }}>Collected {date.collected}</p>}
        {hashtag && <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.2rem", margin: "0.5rem 0 0" }}>{hashtag}</p>}
        <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: soft, margin: "1.6rem 0 0", maxWidth: "36ch" }}>Thank you for being part of our story. We can&rsquo;t wait to see you there.</p>

        {contact && (
          <div style={{ marginTop: "2.2rem", paddingTop: "1.2rem", borderTop: `1px solid color-mix(in srgb, ${p.sheet} 20%, transparent)` }}>
            <p style={{ ...small, margin: 0 }}>Questions before the day</p>
            {contact.name && <p style={{ fontFamily: DISPLAY, fontSize: "1.25rem", margin: "0.45rem 0 0" }}>{contact.name}</p>}
            <p className="flex flex-col gap-1" style={{ fontFamily: MONO, fontSize: 14, margin: "0.4rem 0 0" }}>
              {contact.emailHref && <a href={contact.emailHref} className="focus-visible:outline-2 focus-visible:outline-offset-2" style={link}>{contact.email}</a>}
              {contact.phoneHref && <a href={contact.phoneHref} className="focus-visible:outline-2 focus-visible:outline-offset-2" style={link}>{contact.phone}</a>}
            </p>
          </div>
        )}

        {socials.length > 0 && (
          <ul aria-label="Social links" className="flex flex-wrap gap-x-5 gap-y-2" style={{ listStyle: "none", padding: 0, margin: "1.6rem 0 0" }}>
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center focus-visible:outline-2 focus-visible:outline-offset-2" style={{ ...link, ...small, color: p.sheet }}>
                  {s.label}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: "1.6rem" }}>
          <InvitationDownloadLink
            config={config}
            className="inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ minHeight: 48, padding: "0 1.3rem", borderRadius: 2, border: `1px solid color-mix(in srgb, ${p.sheet} 45%, transparent)`, color: p.sheet, fontFamily: MONO, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", outlineColor: p.sheet }}
          />
        </div>

        {showBranding && (
          <p style={{ fontFamily: SANS, fontSize: 13, color: soft, margin: "2.6rem 0 0" }}>
            Created with{" "}
            <Link href="/" className="focus-visible:outline-2 focus-visible:outline-offset-2" style={link}>
              Selah Vie
            </Link>{" "}
            · Eucalyptus Folio
          </p>
        )}
      </div>
    </footer>
  );
}
