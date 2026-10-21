import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";
import { groupEntourage } from "@/lib/entourage";
import type { Palette } from "../theme";
import { BODY, HEADING } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** Contact-sheet frame number for the heading. */
  index: string;
}

const SIDE_ORDER = { partner1: 0, partner2: 1, none: 2 } as const;
const bySide = (a: WeddingPartyMember, b: WeddingPartyMember) => SIDE_ORDER[a.side ?? "none"] - SIDE_ORDER[b.side ?? "none"];

/** Roles in condensed caps over the names, one category per ruled band. */
export default function EntourageSection({ config, palette: p, index }: Props) {
  const categories = groupEntourage(config.weddingParty ?? []);
  if (categories.length === 0) return null;

  return (
    <section id="entourage" aria-labelledby="mc-entourage-title" style={{ background: p.paper, padding: "6rem 1.25rem", textAlign: "center" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <SectionHeading id="mc-entourage-title" index={index} eyebrow="By our side" title="The Entourage" color={p.slate} muted="rgba(36,39,44,.55)" />
        {categories.map((cat) => (
          <div key={cat.id} style={{ padding: "1.75rem 0 0.5rem", borderTop: "1px solid rgba(36,39,44,.25)" }}>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {cat.roles.map((group) => (
                <div key={group.role} style={{ marginBottom: "1.5rem" }}>
                  <p style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, letterSpacing: "0.28em", paddingLeft: "0.28em", textTransform: "uppercase", color: "rgba(36,39,44,.6)", margin: "0 0 0.5rem" }}>
                    {group.heading}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {[...group.members].sort(bySide).map((m) => (
                      <li key={m.id} style={{ fontFamily: HEADING, fontSize: "clamp(17px, 4.6vw, 20px)", fontWeight: 300, lineHeight: 1.6, color: p.slate }}>
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
