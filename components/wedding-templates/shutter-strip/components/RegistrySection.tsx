import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, MONO, darkroomStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const isWebLink = (url: string) => /^https?:\/\//i.test(url.trim());

/** Torn zigzag foot of a till receipt. */
const RECEIPT_EDGE = "polygon(0 0, 100% 0, 100% calc(100% - 8px), 95% 100%, 90% calc(100% - 8px), 85% 100%, 80% calc(100% - 8px), 75% 100%, 70% calc(100% - 8px), 65% 100%, 60% calc(100% - 8px), 55% 100%, 50% calc(100% - 8px), 45% 100%, 40% calc(100% - 8px), 35% 100%, 30% calc(100% - 8px), 25% 100%, 20% calc(100% - 8px), 15% 100%, 10% calc(100% - 8px), 5% 100%, 0 calc(100% - 8px))";

/** Gift options printed on photo-lab receipts; ones with a link open in a new tab. */
export default function RegistrySection({ config, palette: p }: Props) {
  const links = (config.registryLinks ?? []).filter((l) => l.label.trim());
  if (links.length === 0) return null;

  return (
    <section id="registry" aria-labelledby="ss-registry-title" style={{ ...darkroomStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="ss-registry-title" caption="With gratitude" title="Gifts" color={p.print} accent={p.stamp} style={{ marginBottom: "1.25rem" }} />
        <p style={{ fontFamily: DISPLAY, fontSize: "clamp(18px, 4.8vw, 20px)", lineHeight: 1.65, color: p.paper, margin: "0 auto 2.5rem", maxWidth: 440 }}>
          Having you in the picture is the gift. If you would like to add to it, here is how.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 18 }}>
          {links.map((link, i) => {
            const body = (
              <>
                <p aria-hidden style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.2em", color: p.inkSoft, margin: 0 }}>
                  ITEM {String(i + 1).padStart(2, "0")} ············ 1×
                </p>
                <p style={{ fontFamily: DISPLAY, fontSize: "clamp(20px, 5.4vw, 24px)", color: p.ink, margin: "0.4rem 0 0" }}>{link.label}</p>
                {link.note && (
                  <p style={{ whiteSpace: "pre-line", fontFamily: MONO, fontSize: 15, lineHeight: 1.55, color: p.text, margin: "0.4rem 0 0" }}>{link.note}</p>
                )}
                {isWebLink(link.url) && (
                  <span style={{ display: "inline-block", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: p.film, marginTop: "0.75rem", borderBottom: `1px solid ${p.film}` }}>
                    Open link →
                  </span>
                )}
              </>
            );
            const slip = { display: "block", background: p.print, padding: "1.3rem 1.25rem 1.9rem", clipPath: RECEIPT_EDGE, textDecoration: "none" } as const;
            return (
              <li key={link.id}>
                {isWebLink(link.url) ? (
                  // The clip-path sits on the inner slip so it can't clip the link's focus outline.
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4" style={{ textDecoration: "none", outlineColor: p.stamp }}>
                    <div style={slip}>{body}</div>
                  </a>
                ) : (
                  <div style={slip}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
