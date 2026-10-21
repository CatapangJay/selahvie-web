"use client";

import Image from "next/image";
import { groupEntourage, type RoleGroup } from "@/lib/entourage";
import { partnerNames } from "@/lib/guestSides";
import type { WeddingConfig, WeddingPartyMember } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
}

const SIDE_ORDER = { partner1: 0, partner2: 1, none: 2 } as const;
const bySide = (a: WeddingPartyMember, b: WeddingPartyMember) =>
  SIDE_ORDER[a.side ?? "none"] - SIDE_ORDER[b.side ?? "none"];

/** Entourage, grouped by category and role in ceremony order. Renders nothing until someone is named. */
export default function WeddingPartySection({ config, primary, accent }: Props) {
  const categories = groupEntourage(config.weddingParty ?? []);
  if (categories.length === 0) return null;
  const { p1, p2 } = partnerNames(config);

  // Parents and grandparents read best per partner ("Ana's parents").
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
    <section className="py-24" id="wedding-party" style={{ background: "var(--color-surface-container-low)" }}>
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-14 text-center">
          <p className="label-luxury mb-3" style={{ color: primary }}>By Our Side</p>
          <h2 className="headline-md" style={{ color: "var(--color-on-surface)" }}>The Entourage</h2>
        </div>

        <div className="space-y-14">
          {categories.map((cat) => {
            const roles = rolesFor(cat.id, cat.roles);
            const multi = roles.length > 1;
            return (
              <div key={cat.id} className="text-center">
                {multi && (
                  <h3 className="mb-6 text-xl" style={{ fontFamily: "var(--font-serif)", fontWeight: 400, color: primary }}>
                    {cat.label}
                  </h3>
                )}
                <div className={multi ? "grid gap-x-10 gap-y-8 sm:grid-cols-2" : undefined}>
                  {roles.map((r) => (
                    <div key={r.heading || r.role}>
                      {r.heading && (
                        <p
                          className={multi ? "label-luxury mb-3" : "mb-4 text-xl"}
                          style={
                            multi
                              ? { color: "var(--color-on-surface-muted)" }
                              : { fontFamily: "var(--font-serif)", fontWeight: 400, color: primary }
                          }
                        >
                          {r.heading}
                        </p>
                      )}
                      <ul className="space-y-2">
                        {r.members.map((m) => (
                          <li key={m.id} className="flex flex-col items-center gap-2">
                            {m.photoUrl && (
                              <span className="relative block h-16 w-16 overflow-hidden rounded-full" style={{ border: `2px solid ${accent}40` }}>
                                <Image src={m.photoUrl} alt="" fill className="object-cover" sizes="64px" />
                              </span>
                            )}
                            <span className="text-base" style={{ color: "var(--color-on-surface)" }}>{m.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
