import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";
import { groupEntourage } from "@/lib/entourage";
import type { Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

const SIDE_ORDER = { partner1: 0, partner2: 1, none: 2 } as const;
const bySide = (a: WeddingPartyMember, b: WeddingPartyMember) => SIDE_ORDER[a.side ?? "none"] - SIDE_ORDER[b.side ?? "none"];

/** Each category as a rounded "posy card"; roles in small caps, names in the soft serif. */
export default function EntourageSection({ config, palette: p, band }: Props) {
  const categories = groupEntourage(config.weddingParty ?? []);
  if (categories.length === 0) return null;
  const t = tones(band, p);

  return (
    <section id="entourage" aria-labelledby="ah-entourage-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <SectionTitle id="ah-entourage-title" eyebrow="The ones beside us" title="Our people" band={band} palette={p} />
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.id} style={{ background: t.card, borderRadius: "1.75rem", padding: "1.6rem 1.4rem", textAlign: "center", boxShadow: band.dark ? `inset 0 0 0 1px ${t.rule}` : undefined }}>
              {cat.roles.map((group) => (
                <div key={group.role} style={{ marginBottom: "1.1rem" }}>
                  <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase", color: band.dark ? p.butter : p.apricotDeep, margin: "0 0 0.35rem" }}>
                    {group.heading}
                  </p>
                  {[...group.members].sort(bySide).map((m) => (
                    <p key={m.id} style={{ fontFamily: DISPLAY, fontWeight: 300, fontSize: "1.2rem", lineHeight: 1.5, color: band.dark ? p.morning : p.ink, margin: 0 }}>
                      {m.name}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
