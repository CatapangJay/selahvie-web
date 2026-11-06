import type { Palette } from "../theme";
import { DISPLAY, MONO, SANS, paperStyle } from "../theme";
import { SHEET_PAD, SectionHeading } from "./Motion";

interface Props {
  title: string;
  description: string;
  swatches: string[];
  palette: Palette;
}

/** What to wear, with the couple's colours as paint chips pinned in a row and their hex typed beneath. */
export default function DressCodeSection({ title, description, swatches, palette: p }: Props) {
  return (
    <section id="attire" aria-labelledby="ef-attire-title" style={{ ...paperStyle(p), padding: SHEET_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="ef-attire-title" caption="Attire" title={title || "What to wear"} ink={p.ink} soft={p.inkSoft} rust={p.rust} />
        {description && <p style={{ fontFamily: SANS, fontSize: "clamp(15px, 4.2cqw, 17px)", lineHeight: 1.7, color: p.text, margin: 0, maxWidth: "38ch" }}>{description}</p>}
        {swatches.length > 0 && (
          <ul aria-label="Colour palette" className="flex flex-wrap gap-4" style={{ listStyle: "none", padding: 0, margin: "1.8rem 0 0" }}>
            {swatches.map((hex) => (
              <li key={hex} style={{ width: 64 }}>
                <span aria-hidden style={{ display: "block", height: 80, background: hex, boxShadow: "0 1px 0 rgba(255,255,255,.4) inset, 0 8px 14px -10px rgba(30,34,24,.6)", border: `1px solid color-mix(in srgb, ${p.ink} 15%, transparent)` }} />
                <span style={{ display: "block", fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: p.inkSoft, marginTop: 6, textTransform: "uppercase" }}>{hex}</span>
              </li>
            ))}
          </ul>
        )}
        {!description && !swatches.length && <p style={{ fontFamily: DISPLAY, fontStyle: "italic", color: p.inkSoft }}>{title}</p>}
      </div>
    </section>
  );
}
