import { Gift } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

const isWebLink = (url: string) => /^https?:\/\//i.test(url.trim());

export default function RegistrySection({ config, palette: p, band }: Props) {
  const links = (config.registryLinks ?? []).filter((l) => l.label.trim());
  if (links.length === 0) return null;
  const t = tones(band, p);

  return (
    <section id="registry" aria-labelledby="ah-registry-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <SectionTitle id="ah-registry-title" eyebrow="If you'd like" title="Gifts & wishes" band={band} palette={p} style={{ marginBottom: "1rem" }} />
        <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: "1.05rem", lineHeight: 1.7, color: t.soft, margin: "0 auto 2rem", maxWidth: 420 }}>
          Sharing the evening with you is what we&apos;re most excited for. If you&apos;d still like to mark the day, here&apos;s where.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
          {links.map((link) => {
            const inner = (
              <>
                <span aria-hidden style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: "50%", background: band.dark ? p.butter : p.apricotSoft }}>
                  <Gift size={18} style={{ color: p.apricotDeep }} />
                </span>
                <span style={{ minWidth: 0, textAlign: "left" }}>
                  <span style={{ display: "block", fontFamily: DISPLAY, fontSize: "1.25rem", color: band.dark ? p.morning : p.ink }}>{link.label}</span>
                  {link.note && <span style={{ display: "block", whiteSpace: "pre-line", fontFamily: SANS, fontWeight: 300, fontSize: 15, color: t.soft, marginTop: 2 }}>{link.note}</span>}
                </span>
              </>
            );
            const row = { display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderRadius: 999, background: t.card, textDecoration: "none" } as const;
            return (
              <li key={link.id}>
                {isWebLink(link.url) ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ ...row, outlineColor: t.text }}>
                    {inner}
                    <span aria-hidden style={{ marginLeft: "auto", fontFamily: SANS, color: t.accent }}>→</span>
                  </a>
                ) : (
                  <div style={row}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
