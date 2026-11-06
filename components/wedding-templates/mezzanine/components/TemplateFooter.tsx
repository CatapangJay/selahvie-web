import Link from "next/link";
import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, ENGRAVED, GUTTER, SANS } from "../theme";

/** The lobby on the way out: the names once more, the date, who to ask, and the way home. */
export default function TemplateFooter({ config, palette: p, date, showBranding }: { config: WeddingConfig; palette: Palette; date: DateParts; showBranding: boolean }) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const on = p.linenOn;
  const soft = `color-mix(in srgb, ${on} 74%, transparent)`;
  const rule = `1px solid color-mix(in srgb, ${p.bronzeLight} 30%, transparent)`;
  const link: CSSProperties = { color: on, textDecoration: "underline", textUnderlineOffset: 4, textDecorationColor: `color-mix(in srgb, ${p.bronzeLight} 60%, transparent)`, outlineColor: on };

  return (
    <footer style={{ background: p.oxbloodDeep, color: on, padding: `4.5rem ${GUTTER} 2.5rem` }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <p style={{ fontFamily: DISPLAY, fontSize: "clamp(2.4rem, 12cqw, 4rem)", lineHeight: 1, letterSpacing: "-0.01em", margin: 0, overflowWrap: "anywhere" }}>
          {config.partner1Name} <span style={{ color: p.bronzeLight }}>&amp;</span> {config.partner2Name}
        </p>
        {date.numeric && <p style={{ fontFamily: ENGRAVED, fontSize: 14, letterSpacing: "0.16em", color: soft, margin: "1rem 0 0" }}>{date.numeric}</p>}
        {hashtag && <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 16, margin: "0.4rem 0 0" }}>{hashtag}</p>}
        <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.72, color: soft, margin: "1.6rem 0 0", maxWidth: "36ch" }}>Thank you for being part of our story, near or far. We can&rsquo;t wait to celebrate.</p>

        {contact && (
          <div style={{ marginTop: "2.2rem", paddingTop: "1.3rem", borderTop: rule }}>
            <p style={{ fontFamily: SANS, fontSize: 15, color: soft, margin: 0 }}>Questions before the day</p>
            {contact.name && <p style={{ fontFamily: DISPLAY, fontSize: "1.3rem", margin: "0.4rem 0 0" }}>{contact.name}</p>}
            <p className="flex flex-col" style={{ fontFamily: SANS, fontSize: 16, margin: "0.2rem 0 0" }}>
              {contact.emailHref && <a href={contact.emailHref} className="inline-flex min-h-[44px] items-center self-start focus-visible:outline-2 focus-visible:outline-offset-2" style={link}>{contact.email}</a>}
              {contact.phoneHref && <a href={contact.phoneHref} className="inline-flex min-h-[44px] items-center self-start focus-visible:outline-2 focus-visible:outline-offset-2" style={link}>{contact.phone}</a>}
            </p>
          </div>
        )}

        {socials.length > 0 && (
          <ul aria-label="Social links" className="flex flex-wrap gap-x-6" style={{ listStyle: "none", padding: 0, margin: "1.4rem 0 0" }}>
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center focus-visible:outline-2 focus-visible:outline-offset-2" style={{ ...link, fontFamily: SANS, fontSize: 15 }}>
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: "1.6rem" }}>
          <InvitationDownloadLink
            config={config}
            className="inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ minHeight: 48, padding: "0 1.4rem", borderRadius: 999, border: `1px solid color-mix(in srgb, ${on} 45%, transparent)`, color: on, fontFamily: SANS, fontWeight: 500, fontSize: 15, textDecoration: "none", outlineColor: on }}
          />
        </div>

        {showBranding && (
          <p style={{ fontFamily: SANS, fontSize: 14, color: soft, margin: "2.6rem 0 0", paddingTop: "1.2rem", borderTop: rule }}>
            Created with{" "}
            <Link href="/" className="focus-visible:outline-2 focus-visible:outline-offset-2" style={link}>
              Selah Vie
            </Link>{" "}
            · Mezzanine
          </p>
        )}
      </div>
    </footer>
  );
}
