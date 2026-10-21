import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SERIF, banigStyle, capizStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const isWebLink = (url: string) => /^https?:\/\//i.test(url.trim());

/** Gift options as small capiz plaques on banig; ones with a link open in a new tab. */
export default function RegistrySection({ config, palette: p }: Props) {
  const links = (config.registryLinks ?? []).filter((l) => l.label.trim());
  if (links.length === 0) return null;

  return (
    <section id="registry" aria-labelledby="nk-registry-title" style={{ ...banigStyle(p), padding: "6rem 1.25rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="nk-registry-title" eyebrow="Handog" title="Gifts" color={p.narraDeep} accent={p.molave} style={{ marginBottom: "1.25rem" }} />
        <p style={{ fontFamily: SERIF, fontSize: "clamp(18px, 4.8vw, 20px)", lineHeight: 1.65, color: p.ink, margin: "0 auto 2.5rem", maxWidth: 460 }}>
          Your presence is already the most precious gift. For those who wish to give more, here is how.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {links.map((link) => {
            const body = (
              <>
                <p style={{ fontFamily: DISPLAY, fontSize: "clamp(18px, 5vw, 22px)", letterSpacing: "0.05em", color: p.narraDeep, margin: 0 }}>{link.label}</p>
                {link.note && (
                  <p style={{ whiteSpace: "pre-line", fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: p.ink, margin: "0.3rem 0 0" }}>{link.note}</p>
                )}
                {isWebLink(link.url) && (
                  <span style={{ display: "inline-block", fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: p.molave, marginTop: "0.6rem", borderBottom: `1px solid ${p.brass}` }}>
                    Buksan →
                  </span>
                )}
              </>
            );
            const box = { ...capizStyle(p, 96), display: "block", padding: "1.4rem 1.25rem", boxShadow: `inset 0 0 0 1px ${p.brass}, 0 0 0 4px ${p.narra}`, textDecoration: "none" } as const;
            return (
              <li key={link.id}>
                {isWebLink(link.url) ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4" style={{ ...box, outlineColor: p.narra }}>
                    {body}
                  </a>
                ) : (
                  <div style={box}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
