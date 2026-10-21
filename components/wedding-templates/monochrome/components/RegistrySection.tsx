import { ArrowUpRight } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { BODY, HEADING } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** Contact-sheet frame number for the heading. */
  index: string;
}

const isWebLink = (url: string) => /^https?:\/\//i.test(url.trim());

/** Ruled list of gift options; rows with a link get an arrow and become tappable. */
export default function RegistrySection({ config, palette: p, index }: Props) {
  const links = (config.registryLinks ?? []).filter((l) => l.label.trim());
  if (links.length === 0) return null;

  return (
    <section id="registry" aria-labelledby="mc-registry-title" style={{ background: p.stone, padding: "6rem 1.25rem", textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="mc-registry-title" index={index} eyebrow="With gratitude" title="Gifts" color={p.slate} muted="rgba(36,39,44,.55)" style={{ marginBottom: "1.25rem" }} />
        <p style={{ fontFamily: HEADING, fontSize: "clamp(15px, 4.2vw, 17px)", fontWeight: 300, color: "rgba(36,39,44,.78)", margin: "0 auto 2.5rem", lineHeight: 1.7, maxWidth: 440 }}>
          Having you with us is gift enough. For those who have asked, here are a few ways to send your love.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, textAlign: "left", borderTop: `1px solid ${p.slate}` }}>
          {links.map((link) => {
            const body = (
              <>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: HEADING, fontSize: "clamp(18px, 5vw, 22px)", fontWeight: 300, color: p.slate, margin: 0 }}>{link.label}</p>
                  {link.note && (
                    <p style={{ whiteSpace: "pre-line", fontFamily: BODY, fontSize: 15, letterSpacing: "0.08em", color: "rgba(36,39,44,.65)", margin: "0.25rem 0 0" }}>{link.note}</p>
                  )}
                </div>
                {isWebLink(link.url) && (
                  <ArrowUpRight size={20} aria-hidden className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: p.slate }} />
                )}
              </>
            );
            const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1.4rem 0.25rem", borderBottom: "1px solid rgba(36,39,44,.25)" } as const;
            return (
              <li key={link.id}>
                {isWebLink(link.url) ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24272C]"
                    style={{ ...row, textDecoration: "none" }}
                  >
                    {body}
                  </a>
                ) : (
                  <div style={row}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
