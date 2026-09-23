"use client";

import { BedDouble, Navigation, Info } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
}

/** Travel & accommodation. Renders nothing until at least one field is filled. */
export default function TravelSection({ config, primary, accent }: Props) {
  const travel = config.travel;
  const items = [
    { icon: BedDouble, label: "Where to Stay", value: travel?.accommodations },
    { icon: Navigation, label: "Getting There", value: travel?.directions },
    { icon: Info, label: "Good to Know", value: travel?.notes },
  ].filter((i) => i.value && i.value.trim());

  if (items.length === 0) return null;

  return (
    <section className="py-24" id="travel" style={{ background: "var(--color-surface-container-low)" }}>
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <p className="label-luxury mb-3" style={{ color: primary }}>Plan Your Trip</p>
          <h2 className="headline-md" style={{ color: "var(--color-on-surface)" }}>Travel &amp; Stay</h2>
        </div>

        <div className={`grid grid-cols-1 gap-6 ${items.length > 1 ? "sm:grid-cols-2" : ""} ${items.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {items.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-4 rounded-2xl p-7"
              style={{ background: "var(--color-surface-container-lowest)", border: `1px solid ${accent}25` }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: `${accent}25` }}>
                <Icon size={18} style={{ color: primary }} />
              </span>
              <p className="label-luxury" style={{ color: "var(--color-on-surface-variant)" }}>{label}</p>
              <p className="whitespace-pre-line text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface)" }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
