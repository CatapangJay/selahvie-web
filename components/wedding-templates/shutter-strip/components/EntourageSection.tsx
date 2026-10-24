import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";
import { columnLayout, displayName, groupEntourage } from "@/lib/entourage";
import type { Palette } from "../theme";
import { DISPLAY, MONO, darkroomStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const SIDE_ORDER = { partner1: 0, partner2: 1, none: 2 } as const;
const bySide = (a: WeddingPartyMember, b: WeddingPartyMember) => SIDE_ORDER[a.side ?? "none"] - SIDE_ORDER[b.side ?? "none"];

/** The cast list, like credits rolling in a darkened booth: typed roles in orange, names in didone. */
export default function EntourageSection({ config, palette: p }: Props) {
  const layout = config.entourageLayout;
  const categories = groupEntourage(config.weddingParty ?? []).map((cat) => ({ ...cat, cols: columnLayout(layout, cat.id, cat.roles) }));
  if (categories.length === 0) return null;

  return (
    <section id="entourage" aria-labelledby="ss-entourage-title" style={{ ...darkroomStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="ss-entourage-title" caption="In the picture" title="The |Entourage" color={p.print} accent={p.stamp} />
        {categories.map((cat, ci) => (
          <div key={cat.id} style={{ padding: "1.75rem 0 0.5rem", borderTop: ci === 0 ? "none" : `1px dashed color-mix(in srgb, ${p.paper} 25%, transparent)` }}>
            <div className={`grid gap-x-8 ${cat.cols?.roles ?? "sm:grid-cols-2"}`}>
              {cat.roles.map((group) => (
                <div key={group.role} style={{ marginBottom: "1.5rem" }}>
                  <p style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: "0.22em", paddingLeft: "0.22em", textTransform: "uppercase", color: p.stamp, margin: "0 0 0.4rem" }}>
                    {group.heading}
                  </p>
                  <ul className={cat.cols?.names && `grid gap-x-6 ${cat.cols.names}`} style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {[...group.members].sort(bySide).map((m) => (
                      <li key={m.id} style={{ fontFamily: DISPLAY, fontSize: "clamp(18px, 4.8vw, 21px)", lineHeight: 1.55, color: p.paper }}>
                        {displayName(m, layout?.parentNames)}
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
