import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";
import { groupEntourage } from "@/lib/entourage";
import type { Palette } from "../theme";
import { DISPLAY, SERIF, banigStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const SIDE_ORDER = { partner1: 0, partner2: 1, none: 2 } as const;
const bySide = (a: WeddingPartyMember, b: WeddingPartyMember) => SIDE_ORDER[a.side ?? "none"] - SIDE_ORDER[b.side ?? "none"];

/** The entourage as printed in an old missal: role in engraved caps, names in book serif. */
export default function EntourageSection({ config, palette: p }: Props) {
  const categories = groupEntourage(config.weddingParty ?? []);
  if (categories.length === 0) return null;

  return (
    <section id="entourage" aria-labelledby="nk-entourage-title" style={{ ...banigStyle(p), padding: "6rem 1.25rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="nk-entourage-title" eyebrow="Ang aming mga kasama" title="The Entourage" color={p.narraDeep} accent={p.molave} />
        {categories.map((cat, ci) => (
          <div key={cat.id} style={{ padding: "1.75rem 0 0.5rem", borderTop: ci === 0 ? "none" : `1px solid color-mix(in srgb, ${p.molave} 40%, transparent)` }}>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {cat.roles.map((group) => (
                <div key={group.role} style={{ marginBottom: "1.5rem" }}>
                  <p style={{ fontFamily: DISPLAY, fontSize: 13, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase", color: p.molave, margin: "0 0 0.4rem" }}>
                    {group.heading}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {[...group.members].sort(bySide).map((m) => (
                      <li key={m.id} style={{ fontFamily: SERIF, fontSize: "clamp(18px, 4.8vw, 21px)", lineHeight: 1.55, color: p.ink }}>
                        {m.name}
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
