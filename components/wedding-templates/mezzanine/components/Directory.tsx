import type { Palette } from "../theme";
import { DISPLAY, ENGRAVED, GUTTER, SANS } from "../theme";
import { FloorPlate } from "./Motion";

export interface FloorEntry {
  /** Anchor id of the section. */
  id: string;
  /** Name in the directory. */
  label: string;
}

/**
 * The lobby directory board, dark felt in a bronze frame: every floor of the invitation in order, each a
 * link to its section. Floor numbers come from the page order of the sections
 * this guest can see, so the board and the floor buttons always agree.
 */
export default function Directory({ floors, palette: p }: { floors: FloorEntry[]; palette: Palette }) {
  if (floors.length < 2) return null;
  const board = "#16100F";
  const soft = `color-mix(in srgb, ${p.linenOn} 70%, transparent)`;
  return (
    <nav id="mz-directory" aria-labelledby="mz-directory-title" style={{ scrollMarginTop: 12, background: p.linen, padding: `3.25rem ${GUTTER}` }}>
      {/* A lobby board: dark felt in a thin bronze frame, the floors in engraved capitals. */}
      <div style={{ maxWidth: 600, margin: "0 auto", background: board, color: p.linenOn, padding: "1.6rem clamp(1rem, 5cqw, 1.6rem) 1.2rem", border: `1px solid ${p.bronze}`, outline: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)`, outlineOffset: 4, boxShadow: "0 20px 34px -26px rgba(22,16,15,.8)" }}>
        <h2 id="mz-directory-title" style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.6rem, 7cqw, 2.1rem)", lineHeight: 1.1, margin: 0 }}>
          Directory
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: soft, margin: "0.35rem 0 1.1rem" }}>Everything you need, floor by floor.</p>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, borderTop: `1px solid color-mix(in srgb, ${p.bronzeLight} 30%, transparent)` }}>
          {floors.map((f, i) => (
            <li key={f.id} style={{ borderBottom: `1px solid color-mix(in srgb, ${p.bronzeLight} 16%, transparent)` }}>
              <a href={`#${f.id}`} className="group flex items-center focus-visible:outline-2 focus-visible:outline-offset-2" style={{ gap: "0.85rem", minHeight: 48, color: p.linenOn, textDecoration: "none", outlineColor: p.lamp }}>
                <FloorPlate n={i + 1} palette={p} size={28} onDark />
                <span style={{ fontFamily: ENGRAVED, fontSize: 16, letterSpacing: "0.08em" }}>
                  <span className="sr-only">Floor {i + 1}: </span>
                  {f.label}
                </span>
                <span aria-hidden style={{ flex: 1, alignSelf: "center", borderBottom: `1px dotted color-mix(in srgb, ${p.bronzeLight} 45%, transparent)`, margin: "0 0.2rem", transform: "translateY(4px)" }} />
                <span aria-hidden className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" style={{ fontFamily: SANS, fontSize: 15, color: p.bronzeLight }}>
                  →
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
