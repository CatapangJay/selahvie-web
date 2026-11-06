import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";
import { columnLayout, displayName, groupEntourage } from "@/lib/entourage";
import type { Palette } from "../theme";
import { DISPLAY, ENGRAVED, SANS } from "../theme";
import { Floor, FloorHeading } from "./Motion";

const SIDE_ORDER = { partner1: 0, partner2: 1, none: 2 } as const;
const bySide = (a: WeddingPartyMember, b: WeddingPartyMember) => SIDE_ORDER[a.side ?? "none"] - SIDE_ORDER[b.side ?? "none"];

/** The wedding party like a hotel's guest register: categories ruled off in bronze, roles engraved, names in the display face. */
export default function EntourageSection({ config, floor, palette: p }: { config: WeddingConfig; floor: number; palette: Palette }) {
  const layout = config.entourageLayout;
  const categories = groupEntourage(config.weddingParty ?? []).map((cat) => ({ ...cat, cols: columnLayout(layout, cat.id, cat.roles) }));
  if (categories.length === 0) return null;

  return (
    <Floor id="entourage" labelledBy="mz-entourage-title" background={p.linen} maxWidth={660}>
      <FloorHeading id="mz-entourage-title" floor={floor} title="Standing with us" palette={p} />
      {categories.map((cat) => (
        <div key={cat.id} style={{ borderTop: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)`, padding: "1.5rem 0 0.4rem" }}>
          {cat.label && <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.3rem, 5.6cqw, 1.6rem)", color: p.oxblood, margin: "0 0 1.1rem" }}>{cat.label}</h3>}
          <div className={`grid gap-x-8 ${cat.cols?.roles ?? "grid-cols-2"}`}>
            {cat.roles.map((group) => (
              <div key={group.role} style={{ marginBottom: "1.4rem", minWidth: 0 }}>
                {group.heading.trim().toLowerCase() !== (cat.label ?? "").trim().toLowerCase() && (
                  <p style={{ fontFamily: ENGRAVED, fontSize: 14, letterSpacing: "0.1em", color: p.inkSoft, margin: "0 0 0.4rem" }}>{group.heading}</p>
                )}
                <ul className={cat.cols?.names && `grid gap-x-6 ${cat.cols.names}`} style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[...group.members].sort(bySide).map((m) => (
                    <li key={m.id} style={{ fontFamily: SANS, fontSize: "clamp(15px, 4.2cqw, 17px)", fontWeight: 500, lineHeight: 1.5, color: p.ink, overflowWrap: "anywhere" }}>
                      {displayName(m, layout?.parentNames)}
                      {m.relationship?.trim() && <span style={{ display: "block", fontWeight: 400, fontSize: 14, color: p.inkSoft }}>{m.relationship.trim()}</span>}
                      {m.message?.trim() && <span style={{ display: "block", fontWeight: 400, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: p.inkSoft, margin: "0.15rem 0 0.5rem" }}>{m.message.trim()}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Floor>
  );
}
