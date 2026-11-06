import type { Palette } from "../theme";
import { BODY, DISPLAY, SANS } from "../theme";
import { Floor, FloorHeading } from "./Motion";

interface Props {
  title: string;
  description: string;
  swatches: string[];
  floor: number;
  palette: Palette;
}

/** What to wear, on oxblood; the couple's colours as a row of round lift buttons seated in linen rings. */
export default function DressCodeSection({ title, description, swatches, floor, palette: p }: Props) {
  return (
    <Floor id="attire" labelledBy="mz-attire-title" background={p.oxblood} color={p.linenOn}>
      <FloorHeading id="mz-attire-title" floor={floor} title="What to wear" palette={p} onDark />
      {title && <p style={{ fontFamily: DISPLAY, fontSize: "clamp(1.4rem, 6.4cqw, 1.9rem)", lineHeight: 1.2, margin: 0 }}>{title}</p>}
      {description && (
        <p style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.72, color: `color-mix(in srgb, ${p.linenOn} 86%, transparent)`, margin: "0.8rem 0 0", maxWidth: "52ch" }}>{description}</p>
      )}
      {swatches.length > 0 && (
        <ul aria-hidden className="flex flex-wrap" style={{ listStyle: "none", padding: 0, margin: "2rem 0 0", gap: "1.1rem 1.3rem" }}>
          {swatches.map((hex) => (
            <li key={hex} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span aria-hidden style={{ width: 48, height: 48, borderRadius: "50%", background: hex, boxShadow: `0 0 0 3px ${p.linenOn}, 0 0 0 4px color-mix(in srgb, ${p.bronzeLight} 70%, transparent)` }} />
            </li>
          ))}
        </ul>
      )}
    </Floor>
  );
}
