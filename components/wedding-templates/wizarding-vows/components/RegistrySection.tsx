import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { BOOK, CAPS, DISPLAY, capsLabel, slateStyle, parchmentStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const isWebLink = (url: string) => /^https?:\/\//i.test(url.trim());

/** A round vault door with its bolts and wheel. */
function VaultDoor({ palette: p }: { palette: Palette }) {
  return (
    <svg aria-hidden viewBox="0 0 60 60" width={54} height={54} style={{ flexShrink: 0 }}>
      <circle cx={30} cy={30} r={28} fill={p.slateSoft} stroke={p.gilt} strokeWidth={2.5} />
      <circle cx={30} cy={30} r={20} fill="none" stroke={p.gilt} strokeWidth={1} opacity={0.6} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <circle key={i} cx={30 + 24 * Math.cos(a)} cy={30 + 24 * Math.sin(a)} r={1.8} fill={p.gilt} />;
      })}
      <circle cx={30} cy={30} r={7} fill="none" stroke={p.gilt} strokeWidth={2} />
      <path d="M30,16 V44 M16,30 H44" stroke={p.gilt} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

/** Gift options as numbered vaults deep under the bank; ones with a link open in a new tab. */
export default function RegistrySection({ config, palette: p }: Props) {
  const links = (config.registryLinks ?? []).filter((l) => l.label.trim());
  if (links.length === 0) return null;

  return (
    <section id="vault" aria-labelledby="wv-registry-title" style={{ ...slateStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="wv-registry-title" kicker="With gratitude" title="The Vault" color={p.chalk} accent={p.gilt} style={{ marginBottom: "1.25rem" }} />
        <p style={{ fontFamily: BOOK, fontSize: "clamp(18px, 4.8vw, 20px)", lineHeight: 1.65, color: p.chalk, margin: "0 auto 2.5rem", maxWidth: 440 }}>
          Your company is the greatest magic of all. Should you wish to add a little gold to our vault, here is the way down.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {links.map((link, i) => {
            const body = (
              <div style={{ ...parchmentStyle(p), display: "flex", gap: "1.1rem", alignItems: "center", textAlign: "left", padding: "1.3rem 1.25rem", borderRadius: 3, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.gilt} 60%, transparent), 0 18px 30px -22px rgba(0,0,0,.9)` }}>
                <VaultDoor palette={p} />
                <div style={{ minWidth: 0 }}>
                  <p aria-hidden style={{ ...capsLabel(p.inkSoft, 10), paddingLeft: 0, margin: 0 }}>Vault No. {String(711 + i * 2)}</p>
                  <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(19px, 5.2vw, 23px)", lineHeight: 1.2, color: p.ink, margin: "0.25rem 0 0" }}>{link.label}</p>
                  {link.note && <p style={{ whiteSpace: "pre-line", fontFamily: BOOK, fontSize: 16, lineHeight: 1.5, color: p.ink, margin: "0.35rem 0 0" }}>{link.note}</p>}
                  {isWebLink(link.url) && (
                    <span style={{ display: "inline-block", fontFamily: CAPS, fontWeight: 700, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: p.wax, marginTop: "0.6rem", borderBottom: `1px solid ${p.wax}` }}>
                      Open the vault →
                    </span>
                  )}
                </div>
              </div>
            );
            return (
              <li key={link.id}>
                {isWebLink(link.url) ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4" style={{ textDecoration: "none", outlineColor: p.gilt }}>
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
