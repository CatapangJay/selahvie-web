import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { contactOf, hashtagOf, socialLinksOf } from "@/lib/weddingDetails";
import InvitationDownloadLink from "@/components/wedding-templates/_shared/InvitationDownloadLink";
import { BOOK, DISPLAY, QUILL, capsLabel, giltText, slateStyle } from "../theme";
import DriedSpray from "./DriedFlowers";
import { Hallows } from "./Emblems";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

/** The map wiped clean: the Hallows drawn once more, "Mischief managed", the names in quill between dried flowers. */
export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  const contact = contactOf(config);
  const socials = socialLinksOf(config);
  const hashtag = hashtagOf(config);
  const link = "underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <footer style={{ ...slateStyle(p), containerType: "inline-size", position: "relative", overflow: "hidden", textAlign: "center", padding: "5rem 1.25rem 7rem" }}>
      <DriedSpray tone="light" style={{ position: "absolute", left: 0, bottom: 0, width: "min(40cqw, 15rem)" }} />
      <DriedSpray tone="light" flip style={{ position: "absolute", right: 0, bottom: 0, width: "min(36cqw, 13.5rem)" }} />
      <Hallows color={p.gilt} size={78} strokeWidth={2.5} draw style={{ display: "block", margin: "0 auto" }} />
      <p style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.9rem, 9cqw, 3rem)", lineHeight: 1.1, letterSpacing: "0.06em", margin: "1.6rem 0 0", ...giltText(p) }}>Mischief Managed</p>
      <p style={{ fontFamily: QUILL, fontSize: "clamp(2rem, 9cqw, 3rem)", lineHeight: 1.2, color: p.chalk, margin: "0.6rem 0 0" }}>
        {config.partner1Name} &amp; {config.partner2Name}
      </p>
      {date.roman && <p style={{ ...capsLabel(p.giltSoft, 12), margin: "0.8rem 0 0" }}>{date.roman}</p>}
      {hashtag && <p style={{ position: "relative", fontFamily: QUILL, fontSize: "clamp(1.6rem, 7cqw, 2.1rem)", color: p.gilt, margin: "1.2rem 0 0" }}>{hashtag}</p>}
      {contact && (
        <div style={{ position: "relative", fontFamily: BOOK, fontSize: 17, color: p.chalk, margin: "2rem 0 0" }}>
          <p style={{ ...capsLabel(p.giltSoft, 11), margin: "0 0 0.4rem" }}>{contact.name ? `Owl ${contact.name}` : "Send an owl"}</p>
          <p style={{ margin: 0 }}>
            {contact.emailHref && <a href={contact.emailHref} className={link} style={{ color: p.chalk, outlineColor: p.gilt }}>{contact.email}</a>}
            {contact.emailHref && contact.phoneHref && <span aria-hidden> · </span>}
            {contact.phoneHref && <a href={contact.phoneHref} className={link} style={{ color: p.chalk, outlineColor: p.gilt }}>{contact.phone}</a>}
          </p>
        </div>
      )}
      {socials.length > 0 && (
        <ul aria-label="Social links" className="flex flex-wrap justify-center gap-x-6 gap-y-2" style={{ position: "relative", listStyle: "none", padding: 0, margin: "1.5rem 0 0" }}>
          {socials.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className={link} style={{ ...capsLabel(p.chalk, 12), outlineColor: p.gilt }}>
                {s.label}<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <div style={{ position: "relative", margin: "2rem 0 0" }}>
        <InvitationDownloadLink
          config={config}
          className="inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ ...capsLabel(p.chalk, 12), minHeight: 48, padding: "0 1.5rem", border: `1px solid ${p.gilt}`, borderRadius: 2, textDecoration: "none", outlineColor: p.gilt }}
        />
      </div>
      {showBranding && (
        <p style={{ fontFamily: BOOK, fontSize: 15, color: `color-mix(in srgb, ${p.chalk} 72%, transparent)`, margin: "2.6rem 0 0" }}>
          Created with{" "}
          <Link href="/" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ color: p.chalk, outlineColor: p.gilt }}>
            Selah Vie
          </Link>{" "}
          · Wizarding Vows
        </p>
      )}
    </footer>
  );
}
