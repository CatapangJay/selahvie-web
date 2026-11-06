import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, MONO, SANS, isWebLink, labelText, paperStyle, sheetStyle } from "../theme";
import { SHEET_PAD, SectionHeading } from "./Motion";

/** A specimen tag's notched corners. */
const TAG = "polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)";

/** Gift options as tie-on specimen tags: an eyelet, the label, any bank or e-wallet details typed underneath. */
export default function RegistrySection({ config, palette: p }: { config: WeddingConfig; palette: Palette }) {
  const links = (config.registryLinks ?? []).filter((l) => l.label.trim());
  if (links.length === 0) return null;

  return (
    <section id="registry" aria-labelledby="ef-registry-title" style={{ ...paperStyle(p), padding: SHEET_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading
          id="ef-registry-title"
          caption="Gifts"
          title="If you'd like to give"
          lede="Your company is the gift we hoped for. For anyone who has asked, here is what would help us begin."
          ink={p.ink}
          soft={p.inkSoft}
          rust={p.rust}
        />
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {links.map((link) => {
            const body = (
              <div style={{ ...sheetStyle(p), clipPath: TAG, display: "flex", gap: "1rem", padding: "1.2rem 1.2rem 1.2rem 1.6rem", boxShadow: "none", border: 0 }}>
                <span aria-hidden style={{ flexShrink: 0, width: 12, height: 12, marginTop: 6, borderRadius: "50%", background: p.paper, boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${p.ink} 40%, transparent)` }} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.25rem, 5.4cqw, 1.5rem)", lineHeight: 1.25, color: p.ink }}>{link.label}</span>
                  {link.note && <span style={{ display: "block", whiteSpace: "pre-line", fontFamily: MONO, fontSize: 13.5, lineHeight: 1.65, color: p.text, marginTop: "0.4rem", overflowWrap: "anywhere" }}>{link.note}</span>}
                  {isWebLink(link.url) && <span style={{ ...labelText(p, 11), display: "inline-block", color: p.rust, marginTop: "0.7rem", borderBottom: `1px solid ${p.rust}` }}>Open<span className="sr-only"> (opens in a new tab)</span></span>}
                </span>
              </div>
            );
            return (
              <li key={link.id} style={{ filter: "drop-shadow(0 10px 12px rgba(30,34,24,.14))" }}>
                {isWebLink(link.url) ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4" style={{ textDecoration: "none", outlineColor: p.ink }}>
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
        <p style={{ fontFamily: SANS, fontStyle: "italic", fontSize: 15, color: p.inkSoft, margin: "1.6rem 0 0" }}>Every kindness goes straight into the home we are planting.</p>
      </div>
    </section>
  );
}
