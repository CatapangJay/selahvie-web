import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import type { DateParts, Palette } from "../theme";
import { SCRIPT, SERIF, feltStyle } from "../theme";
import CalaLily from "./CalaLily";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

const LINK =
  "underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3dc9a]";

export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const small = { fontFamily: SERIF, fontSize: "1.1rem", lineHeight: 1.6, color: p.cream } as const;
  return (
    <footer style={{ ...feltStyle(p.teal, p.tealDeep), padding: "clamp(3.5rem, 8vw, 5.5rem) 1.5rem 2.5rem", textAlign: "center" }}>
      <CalaLily className="mx-auto" style={{ width: "2.25rem", opacity: 0.95 }} />
      <p style={{ fontFamily: SCRIPT, fontSize: "clamp(2.4rem, 7vw, 3.6rem)", lineHeight: 1.15, color: p.cream, marginTop: "0.75rem" }}>
        {config.partner1Name} &amp; {config.partner2Name}
      </p>
      <p
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: "0.9rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: p.goldLight,
          marginTop: "0.5rem",
        }}
      >
        {date.dotted}
      </p>
      {hashtag && <p style={{ fontFamily: SCRIPT, fontSize: "clamp(1.6rem, 5vw, 2.1rem)", color: p.goldLight, marginTop: "1.5rem" }}>{hashtag}</p>}
      {contact && (
        <div style={{ ...small, marginTop: "1.75rem" }}>
          <p style={{ fontWeight: 600, fontSize: "0.82rem", letterSpacing: "0.3em", textTransform: "uppercase", color: p.goldLight }}>Questions? Write to us</p>
          {contact.name && <p style={{ marginTop: "0.35rem" }}>{contact.name}</p>}
          <p className="flex flex-wrap justify-center gap-x-6">
            {contact.emailHref && <a href={contact.emailHref} className={LINK} style={{ color: p.cream }}>{contact.email}</a>}
            {contact.phoneHref && <a href={contact.phoneHref} className={LINK} style={{ color: p.cream }}>{contact.phone}</a>}
          </p>
        </div>
      )}
      {socials.length > 0 && (
        <ul aria-label="Follow along" className="flex flex-wrap justify-center gap-x-6 gap-y-1" style={{ marginTop: "1.5rem" }}>
          {socials.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className={LINK} style={{ ...small, fontStyle: "italic", color: p.goldLight }}>
                {s.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <InvitationDownloadLink
        config={config}
        className="mt-8 inline-block underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3dc9a]"
        style={{ ...small, fontStyle: "italic", color: p.goldLight }}
      />
      {showBranding && (
        <p style={{ fontFamily: SERIF, fontSize: "1rem", color: "rgba(251,246,236,.8)", marginTop: "2.5rem" }}>
          Created with{" "}
          <Link href="/" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3dc9a]" style={{ color: p.goldLight }}>
            Selah Vie
          </Link>{" "}
          · Jewel Tones
        </p>
      )}
    </footer>
  );
}
