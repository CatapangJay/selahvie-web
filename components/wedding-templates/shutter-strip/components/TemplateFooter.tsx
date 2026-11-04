import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import { DISPLAY, MONO, SCRIPT, darkroomStyle, sprocketStyle, stampText } from "../theme";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

/** The end of the roll: the names once more, the date imprint, and a last length of sprockets. */
export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const link = "underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <footer style={{ ...darkroomStyle(p), containerType: "inline-size", textAlign: "center" }}>
      <div aria-hidden style={sprocketStyle(p)} />
      <div style={{ padding: "4.5rem 1.25rem 2.75rem" }}>
        <p style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: p.stamp, margin: 0 }}>That&rsquo;s a wrap — see you there</p>
        <p style={{ fontFamily: DISPLAY, fontSize: "clamp(2.6rem, 12cqw, 4.5rem)", lineHeight: 1.05, color: p.print, margin: "1rem 0 0" }}>
          {config.partner1Name} <span style={{ fontFamily: SCRIPT, color: p.film }}>&amp;</span> <em>{config.partner2Name}</em>
        </p>
        {date.imprint && <p style={{ ...stampText(p), fontSize: 18, margin: "1rem 0 0" }}>{date.imprint}</p>}
        {hashtag && <p style={{ ...stampText(p), fontSize: 16, margin: "0.75rem 0 0" }}>{hashtag}</p>}
        {contact && (
          <div style={{ fontFamily: MONO, fontSize: 15, color: p.paper, margin: "2rem 0 0" }}>
            <p style={{ fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: p.stamp, margin: "0 0 0.4rem" }}>
              {contact.name ? `Questions? Ask ${contact.name}` : "Questions?"}
            </p>
            <p style={{ margin: 0 }}>
              {contact.emailHref && <a href={contact.emailHref} className={link} style={{ color: p.paper, outlineColor: p.stamp }}>{contact.email}</a>}
              {contact.emailHref && contact.phoneHref && <span aria-hidden> · </span>}
              {contact.phoneHref && <a href={contact.phoneHref} className={link} style={{ color: p.paper, outlineColor: p.stamp }}>{contact.phone}</a>}
            </p>
          </div>
        )}
        {socials.length > 0 && (
          <ul aria-label="Social links" className="flex flex-wrap justify-center gap-x-6 gap-y-2" style={{ listStyle: "none", padding: 0, margin: "1.5rem 0 0" }}>
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={link} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: p.paper, outlineColor: p.stamp }}>
                  {s.label}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        <div style={{ margin: "2rem 0 0" }}>
          <InvitationDownloadLink
            config={config}
            className="inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ minHeight: 48, padding: "0 1.5rem", borderRadius: 999, border: `1px solid ${p.stamp}`, color: p.paper, fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", outlineColor: p.stamp }}
          />
        </div>
        {showBranding && (
          <p style={{ fontFamily: MONO, fontSize: 14, color: "rgba(241,234,223,.75)", margin: "2.5rem 0 0" }}>
            Created with{" "}
            <Link href="/" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ color: p.paper, outlineColor: p.stamp }}>
              Selah Vie
            </Link>{" "}
            · Shutter &amp; Strip
          </p>
        )}
      </div>
    </footer>
  );
}
