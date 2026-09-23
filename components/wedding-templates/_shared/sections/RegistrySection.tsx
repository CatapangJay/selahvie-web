"use client";

import { Gift, ArrowUpRight } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
}

/**
 * Registry / gift links. Config-driven and render-nothing-when-empty:
 * returns null when the couple has added no links (DESIGN.md rule).
 * Styled for light templates via surface tokens + the couple's palette.
 */
export default function RegistrySection({ config, primary, accent }: Props) {
  const links = config.registryLinks ?? [];
  if (links.length === 0) return null;

  return (
    <section className="py-24" id="registry">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="label-luxury mb-3" style={{ color: primary }}>With Gratitude</p>
        <h2 className="headline-md mb-4" style={{ color: "var(--color-on-surface)" }}>Registry</h2>
        <p className="mx-auto mb-10 max-w-md text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
          Your presence is the greatest gift. Should you wish to give more, we&apos;ve gathered a few things below.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover group flex items-center justify-between gap-4 rounded-2xl p-6 text-left"
              style={{ background: "var(--color-surface-container-low)", border: `1px solid ${accent}25` }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${accent}25` }}
                >
                  <Gift size={18} style={{ color: primary }} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--color-on-surface)" }}>{link.label}</p>
                  {link.note && (
                    <p className="text-xs font-light truncate" style={{ color: "var(--color-on-surface-muted)" }}>{link.note}</p>
                  )}
                </div>
              </div>
              <ArrowUpRight size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: primary }} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
