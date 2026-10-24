import Image from "next/image";
import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";
import Reveal from "@/components/ui/Reveal";
import { columnLayout, displayName, groupEntourage, type RoleGroup } from "@/lib/entourage";
import { partnerNames } from "@/lib/guestSides";
import type { Palette } from "../theme";
import { SCRIPT, SECTION_PAD, SERIF, paperStyle } from "../theme";
import SectionHeading from "./SectionHeading";
import GiltFrame from "./GiltFrame";
import CalaLily from "./CalaLily";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

const SIDE_ORDER = { partner1: 0, partner2: 1, none: 2 } as const;
const bySide = (a: WeddingPartyMember, b: WeddingPartyMember) => SIDE_ORDER[a.side ?? "none"] - SIDE_ORDER[b.side ?? "none"];

/**
 * The entourage page of a printed invitation: cream stock inside a double gilt
 * rule, each category under a script heading, paired roles side by side.
 */
export default function EntourageSection({ config, palette: p }: Props) {
  const categories = groupEntourage(config.weddingParty ?? []);
  if (categories.length === 0) return null;
  const { p1, p2 } = partnerNames(config);

  // Parents and grandparents read per partner ("Ana's parents"); other roles list partner 1's side first.
  const rolesFor = (id: string, roles: RoleGroup[]): RoleGroup[] => {
    if (id !== "parents") return roles.map((r) => ({ ...r, members: [...r.members].sort(bySide) }));
    return roles.flatMap((r) => {
      const noun = r.heading.toLowerCase();
      return (["partner1", "partner2", undefined] as const)
        .map((side) => ({
          role: r.role,
          heading: side === "partner1" ? `${p1}'s ${noun}` : side === "partner2" ? `${p2}'s ${noun}` : r.heading,
          members: r.members.filter((m) => m.side === side),
        }))
        .filter((g) => g.members.length > 0);
    });
  };

  return (
    <section
      id="entourage"
      aria-labelledby="jt-entourage-title"
      style={{ ...paperStyle(p.cream, p.creamDeep), padding: SECTION_PAD, position: "relative", overflow: "hidden", color: p.ink }}
    >
      <div
        className="relative mx-auto"
        style={{
          maxWidth: "52rem",
          padding: "clamp(2.5rem, 7vw, 4.5rem) clamp(1.25rem, 5vw, 3.5rem)",
          border: `1px solid ${p.gold}`,
          outline: `1px solid color-mix(in srgb, ${p.gold} 55%, transparent)`,
          outlineOffset: "6px",
        }}
      >
        <SectionHeading id="jt-entourage-title" eyebrow="By Our Side" title="The Entourage" palette={p} tone="light" />

        <div>
          {categories.map((cat, ci) => {
            const roles = rolesFor(cat.id, cat.roles);
            const paired = roles.length > 1;
            const cols = columnLayout(config.entourageLayout, cat.id, roles);
            // A single role needs no category heading when the role says it all.
            const showCategory = paired || cat.id === "other";
            return (
              <Reveal key={cat.id} index={0} className="text-center">
                {ci > 0 && (
                  <div aria-hidden className="flex items-center justify-center gap-2" style={{ margin: "clamp(2.25rem, 5vw, 3rem) 0" }}>
                    <span style={{ width: 5, height: 5, transform: "rotate(45deg)", background: p.gold, opacity: 0.6 }} />
                    <span style={{ width: 7, height: 7, transform: "rotate(45deg)", background: p.gold }} />
                    <span style={{ width: 5, height: 5, transform: "rotate(45deg)", background: p.gold, opacity: 0.6 }} />
                  </div>
                )}

                {showCategory && (
                  <h3
                    style={{
                      fontFamily: SCRIPT,
                      fontWeight: 400,
                      fontSize: "clamp(2rem, 5vw, 2.6rem)",
                      lineHeight: 1.15,
                      color: p.raspberryDeep,
                      marginBottom: "clamp(1.25rem, 3vw, 1.75rem)",
                      textWrap: "balance",
                    }}
                  >
                    {cat.label}
                  </h3>
                )}

                <div
                  className={cols ? `grid ${cols.roles}` : paired ? "grid sm:grid-cols-2" : ""}
                  style={{ columnGap: "clamp(2rem, 6vw, 4rem)", rowGap: "clamp(1.75rem, 4vw, 2.25rem)" }}
                >
                  {roles.map((r, ri) => (
                    <div
                      key={r.heading || r.role || ri}
                      // An odd last role sits centred under the pairs.
                      className={!cols && paired && ri === roles.length - 1 && roles.length % 2 === 1 ? "sm:col-span-2" : undefined}
                    >
                      {r.heading && (
                        <p
                          style={{
                            fontFamily: showCategory ? SERIF : SCRIPT,
                            ...(showCategory
                              ? { fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.28em", textTransform: "uppercase", color: p.goldInk }
                              : { fontWeight: 400, fontSize: "clamp(2rem, 5vw, 2.6rem)", lineHeight: 1.15, color: p.raspberryDeep }),
                            marginBottom: showCategory ? "0.9rem" : "clamp(1.1rem, 3vw, 1.5rem)",
                          }}
                        >
                          {r.heading}
                        </p>
                      )}
                      <ul className={cols?.names ? `grid justify-items-center ${cols.names}` : "flex flex-col items-center"} style={{ gap: "0.55rem 1.5rem" }}>
                        {r.members.map((m) => (
                          <Member key={m.id} member={m} name={displayName(m, config.entourageLayout?.parentNames)} palette={p} />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <CalaLily
        className="pointer-events-none absolute hidden sm:block"
        style={{ width: "clamp(4rem, 9vw, 6.5rem)", right: "max(1rem, calc(50% - 30rem))", bottom: "clamp(1.5rem, 4vw, 3rem)", transform: "rotate(-12deg)", filter: "drop-shadow(0 6px 8px rgba(0,0,0,.25))" }}
      />
    </section>
  );
}

function Member({ member: m, name, palette: p }: { member: WeddingPartyMember; name: string; palette: Palette }) {
  return (
    <li className="flex flex-col items-center" style={{ gap: "0.6rem" }}>
      {m.photoUrl && (
        <GiltFrame palette={p} shape="oval" ratio="4 / 5" style={{ width: "5.5rem", padding: "0.3rem" }}>
          <Image src={m.photoUrl} alt="" fill sizes="88px" className="object-cover" />
        </GiltFrame>
      )}
      <span style={{ fontFamily: SERIF, fontSize: "clamp(1.2rem, 2.4vw, 1.35rem)", lineHeight: 1.3, color: p.ink }}>{name}</span>
    </li>
  );
}
