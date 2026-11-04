import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

// Fixed star positions (percent of the footer) so server and client render the same sky.
const STARS = [
  [8, 22, 2], [18, 60, 1.5], [27, 14, 1.5], [38, 44, 2.5], [52, 18, 1.5], [61, 64, 2], [72, 30, 1.5], [83, 12, 2.5], [91, 52, 1.5], [46, 78, 1.5],
] as const;

/** Night after the sunset: a scatter of stars over the couple's names. */
export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const linkClass = "underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2";
  const small = { position: "relative", fontFamily: SANS, fontSize: 15, color: "rgba(255,246,236,.85)" } as const;
  return (
    <footer style={{ position: "relative", overflow: "hidden", background: p.ink, padding: "4.5rem 1.25rem 2.5rem", textAlign: "center", color: p.morning }}>
      {STARS.map(([x, y, r], i) => (
        <span key={i} aria-hidden className="motion-safe:animate-pulse" style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, borderRadius: "50%", background: p.butter, opacity: 0.7, animationDelay: `${i * 0.37}s` }} />
      ))}
      <p style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(2rem, 8vw, 2.8rem)", lineHeight: 1.15, margin: 0 }}>
        {config.partner1Name} <em style={{ color: p.golden }}>&amp;</em> {config.partner2Name}
      </p>
      {date.long && (
        <p style={{ position: "relative", fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,246,236,.7)", marginTop: "0.75rem" }}>
          {date.monthDay}
          {date.year && ` · ${date.year}`}
        </p>
      )}
      <p style={{ position: "relative", fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.2rem", color: p.golden, marginTop: "1.5rem" }}>See you at golden hour.</p>
      {hashtag && <p style={{ position: "relative", fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.6rem", color: p.butter, margin: "1.25rem 0 0" }}>{hashtag}</p>}
      {contact && (
        <div style={{ ...small, marginTop: "1.75rem", lineHeight: 1.8 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,246,236,.7)" }}>Questions? Ask {contact.name || "us"}</p>
          <p style={{ margin: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 1.5rem" }}>
            {contact.emailHref && <a href={contact.emailHref} className={linkClass} style={{ color: p.butter, outlineColor: p.butter }}>{contact.email}</a>}
            {contact.phoneHref && <a href={contact.phoneHref} className={linkClass} style={{ color: p.butter, outlineColor: p.butter }}>{contact.phone}</a>}
          </p>
        </div>
      )}
      {socials.length > 0 && (
        <ul aria-label="Follow along" style={{ ...small, listStyle: "none", padding: 0, margin: "1.25rem 0 0", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25rem 1.5rem" }}>
          {socials.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: p.butter, outlineColor: p.butter }}>
                {s.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <InvitationDownloadLink
        config={config}
        className="inline-flex items-center rounded-full border px-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ ...small, minHeight: 44, marginTop: "1.75rem", borderColor: p.golden, color: p.butter, outlineColor: p.butter, textDecoration: "none" }}
      />
      {showBranding && (
        <p style={{ position: "relative", fontFamily: SANS, fontSize: 14, color: "rgba(255,246,236,.72)", marginTop: "2.25rem" }}>
          Created with{" "}
          <Link href="/" className="font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ color: p.butter, outlineColor: p.butter }}>
            Selah Vie
          </Link>{" "}
          · Apricot Hour
        </p>
      )}
    </footer>
  );
}
