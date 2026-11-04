import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { ACCENT, BODY, numeralDate } from "../theme";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  showBranding: boolean;
}

export default function TemplateFooter({ config, palette: p, showBranding }: Props) {
  const date = numeralDate(config.weddingDate);
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const small = { fontFamily: BODY, fontSize: 14, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,.8)" } as const;
  const linkClass = "underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
  return (
    <footer style={{ background: p.ink, borderTop: "1px solid rgba(255,255,255,.2)", padding: "3.5rem 1rem 2.5rem", textAlign: "center" }}>
      <p style={{ fontFamily: ACCENT, fontSize: "clamp(40px, 11vw, 56px)", color: "#fff", lineHeight: 1, margin: 0 }}>
        {config.partner1Name} &amp; {config.partner2Name}
      </p>
      {date && (
        <p style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, letterSpacing: "0.3em", paddingLeft: "0.3em", color: "rgba(255,255,255,.65)", marginTop: "0.75rem" }}>{date}</p>
      )}
      {hashtag && <p style={{ fontFamily: ACCENT, fontSize: "clamp(30px, 8vw, 40px)", color: "#fff", lineHeight: 1.2, margin: "1.5rem 0 0" }}>{hashtag}</p>}
      {contact && (
        <div style={{ ...small, marginTop: "2rem", lineHeight: 2 }}>
          {contact.name && <p style={{ margin: 0, color: "rgba(255,255,255,.55)" }}>Contact &nbsp;/&nbsp; {contact.name}</p>}
          <p style={{ margin: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 1.5rem" }}>
            {contact.emailHref && <a href={contact.emailHref} className={linkClass} style={{ color: "#fff" }}>{contact.email}</a>}
            {contact.phoneHref && <a href={contact.phoneHref} className={linkClass} style={{ color: "#fff" }}>{contact.phone}</a>}
          </p>
        </div>
      )}
      {socials.length > 0 && (
        <ul aria-label="Follow along" style={{ ...small, listStyle: "none", padding: 0, margin: "1.5rem 0 0", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25rem 1.5rem" }}>
          {socials.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: "#fff" }}>
                {s.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <InvitationDownloadLink config={config} className={`${linkClass} inline-block`} style={{ ...small, color: "#fff", marginTop: "1.75rem" }} />
      {showBranding && (
        <p style={{ fontFamily: BODY, fontSize: 15, letterSpacing: "0.04em", color: "rgba(255,255,255,.72)", marginTop: "2rem" }}>
          Created with{" "}
          <Link href="/" className="font-semibold text-white underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Selah Vie
          </Link>{" "}
          · Monochrome
        </p>
      )}
    </footer>
  );
}
