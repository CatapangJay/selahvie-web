import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";
import { groupEntourage } from "@/lib/entourage";
import type { Palette } from "../theme";
import { BOOK, capsLabel, parchmentStyle } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const SIDE_ORDER = { partner1: 0, partner2: 1, none: 2 } as const;
const bySide = (a: WeddingPartyMember, b: WeddingPartyMember) => SIDE_ORDER[a.side ?? "none"] - SIDE_ORDER[b.side ?? "none"];

/** The roll of the order: each group under a tracked heading set between hairlines, names in garamond. */
export default function EntourageSection({ config, palette: p }: Props) {
  const categories = groupEntourage(config.weddingParty ?? []);
  if (categories.length === 0) return null;

  return (
    <section id="order" aria-labelledby="wv-entourage-title" style={{ ...parchmentStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="wv-entourage-title" kicker="Those who stand with us" title="Our Order" color={p.ink} accent={p.wax} />
        {categories.map((cat, ci) => (
          <div key={cat.id} style={{ padding: "1.6rem 0 0.4rem", borderTop: ci === 0 ? "none" : `1px solid color-mix(in srgb, ${p.inkSoft} 30%, transparent)` }}>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {cat.roles.map((group) => {
                return (
                  <div key={group.role} style={{ marginBottom: "1.6rem" }}>
                    <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.7rem", ...capsLabel(p.wax, 11), fontWeight: 700, margin: "0 0 0.6rem" }}>
                      <span aria-hidden style={{ width: "1.6rem", height: 1, background: `color-mix(in srgb, ${p.wax} 55%, transparent)` }} />
                      {group.heading}
                      <span aria-hidden style={{ width: "1.6rem", height: 1, background: `color-mix(in srgb, ${p.wax} 55%, transparent)` }} />
                    </p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {[...group.members].sort(bySide).map((m) => (
                        <li key={m.id} style={{ fontFamily: BOOK, fontSize: "clamp(18px, 4.8vw, 21px)", lineHeight: 1.55, color: p.ink }}>
                          {m.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
