import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";
import { columnLayout, displayName, groupEntourage } from "@/lib/entourage";
import type { Palette } from "../theme";
import { DISPLAY, MONO, SANS, labelText, paperStyle } from "../theme";
import { SHEET_PAD, SectionHeading } from "./Motion";

const SIDE_ORDER = { partner1: 0, partner2: 1, none: 2 } as const;
const bySide = (a: WeddingPartyMember, b: WeddingPartyMember) => SIDE_ORDER[a.side ?? "none"] - SIDE_ORDER[b.side ?? "none"];

/** The entourage as a folio index: categories as typed tabs, roles as small caps, names in the serif. */
export default function EntourageSection({ config, palette: p }: { config: WeddingConfig; palette: Palette }) {
  const layout = config.entourageLayout;
  const categories = groupEntourage(config.weddingParty ?? []).map((cat) => ({ ...cat, cols: columnLayout(layout, cat.id, cat.roles) }));
  if (categories.length === 0) return null;

  return (
    <section id="entourage" aria-labelledby="ef-entourage-title" style={{ ...paperStyle(p), padding: SHEET_PAD }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <SectionHeading id="ef-entourage-title" caption="Index of names" title="Those who stand with us" ink={p.ink} soft={p.inkSoft} rust={p.rust} />
        {categories.map((cat) => (
          <div key={cat.id} style={{ borderTop: `1px solid color-mix(in srgb, ${p.ink} 30%, transparent)`, padding: "1.4rem 0 0.4rem" }}>
            {cat.label && <h3 style={{ ...labelText(p, 11), color: p.rust, margin: "0 0 1rem" }}>{cat.label}</h3>}
            <div className={`grid gap-x-8 ${cat.cols?.roles ?? "grid-cols-2"}`}>
              {cat.roles.map((group) => (
                <div key={group.role} style={{ marginBottom: "1.3rem" }}>
                  <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: p.inkSoft, margin: "0 0 0.35rem" }}>{group.heading}</p>
                  <ul className={cat.cols?.names && `grid gap-x-6 ${cat.cols.names}`} style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {[...group.members].sort(bySide).map((m) => (
                      <li key={m.id} style={{ fontFamily: DISPLAY, fontSize: "clamp(1.05rem, 4.6cqw, 1.2rem)", lineHeight: 1.45, color: p.ink }}>
                        {displayName(m, layout?.parentNames)}
                        {m.relationship?.trim() && <span style={{ display: "block", fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: p.inkSoft }}>{m.relationship.trim()}</span>}
                        {m.message?.trim() && <span style={{ display: "block", fontFamily: SANS, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: p.text, margin: "0.15rem 0 0.5rem" }}>{m.message.trim()}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
