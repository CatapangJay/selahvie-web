"use client";

import Image from "next/image";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
}

/** Wedding party grid. Renders nothing until a member is added. */
export default function WeddingPartySection({ config, primary, accent }: Props) {
  const members = (config.weddingParty ?? []).filter((m) => m.name.trim());
  if (members.length === 0) return null;

  return (
    <section className="py-24" id="wedding-party" style={{ background: "var(--color-surface-container-low)" }}>
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <p className="label-luxury mb-3" style={{ color: primary }}>By Our Side</p>
          <h2 className="headline-md" style={{ color: "var(--color-on-surface)" }}>The Wedding Party</h2>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          {members.map((m) => (
            <div key={m.id} className="flex flex-col items-center text-center">
              <div
                className="relative mb-4 h-28 w-28 overflow-hidden rounded-full"
                style={{ border: `2px solid ${accent}40` }}
              >
                {m.photoUrl ? (
                  <Image src={m.photoUrl} alt={m.name} fill className="object-cover" sizes="112px" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center font-serif"
                    style={{ background: `${accent}20`, color: primary, fontFamily: "var(--font-serif)", fontSize: "2rem" }}
                  >
                    {m.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{m.name}</p>
              {m.role && (
                <p className="label-luxury mt-1" style={{ color: "var(--color-on-surface-muted)" }}>{m.role}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
