"use client";

import { Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PERSONALIZED_ADDON_CENTS, TIER_INFO, tierPrice } from "@/lib/tiers";
import type { Tier } from "@/types/wedding";

interface Props {
  templatePrice: number;
  value: Tier;
  onChange: (tier: Tier) => void;
  /** Hide the feature list (e.g. in tight spaces like the preview bar). */
  compact?: boolean;
  name?: string;
  /** Premium template: the Base plan isn't offered. */
  personalizedOnly?: boolean;
}

const ORDER: Tier[] = ["personalized", "base"];

/** Radio group for choosing the plan at purchase. Personalized is listed first and marked recommended. */
export default function TierPicker({ templatePrice, value, onChange, compact = false, name = "tier", personalizedOnly = false }: Props) {
  return (
    <fieldset>
      <legend className="label-luxury mb-3" style={{ color: "var(--color-on-surface-muted)" }}>
        Choose your plan
      </legend>
      <div className="flex flex-col gap-2">
        {ORDER.filter((tier) => !personalizedOnly || tier === "personalized").map((tier) => {
          const info = TIER_INFO[tier];
          const selected = value === tier;
          return (
            <label
              key={tier}
              className="flex cursor-pointer gap-3.5 px-4 py-4 transition-colors"
              style={{
                borderRadius: "var(--radius-md)",
                border: `1px solid ${selected ? "var(--color-primary)" : "var(--color-outline)"}`,
                background: selected ? "var(--color-primary-container)" : "transparent",
              }}
            >
              <input
                type="radio"
                name={name}
                value={tier}
                checked={selected}
                onChange={() => onChange(tier)}
                className="mt-1 h-4 w-4 shrink-0"
                style={{ accentColor: "var(--color-primary)" }}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                      {info.label}
                    </span>
                    {tier === "personalized" && (
                      <span
                        className="label-luxury px-2 py-0.5"
                        style={{
                          background: "var(--color-primary)",
                          color: "#fff",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.6rem",
                        }}
                      >
                        {personalizedOnly ? "Included" : "Recommended"}
                      </span>
                    )}
                  </span>
                  <span className="text-sm tabular-nums" style={{ color: "var(--color-on-surface)" }}>
                    {formatPrice(tierPrice(templatePrice, tier))}
                  </span>
                </span>
                <span className="mt-1 text-xs font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                  {tier === "personalized"
                    ? personalizedOnly
                      ? `${info.summary} This design is built around it, so it's always included (${formatPrice(PERSONALIZED_ADDON_CENTS)}).`
                      : `${info.summary} Adds ${formatPrice(PERSONALIZED_ADDON_CENTS)}.`
                    : `${info.summary} You can upgrade later.`}
                </span>
                {!compact && tier === "personalized" && selected && (
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {info.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs font-light" style={{ color: "var(--color-on-surface-variant)" }}>
                        <Check size={12} className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
