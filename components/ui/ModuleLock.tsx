"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { MODULE_LABELS, TIER_INFO, configTier, hasModule, tierFor, upgradePrice } from "@/lib/tiers";
import { formatPrice } from "@/lib/utils";
import type { ModuleKey, Tier, WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  module: ModuleKey;
  /** Starts an upgrade to the given package. */
  onUpgrade: (to: Tier) => void;
  /** Name used in the prompt. Defaults to the module's label. */
  label?: string;
  /** The editor. Shown as is when the package includes the module; dimmed and inert when it doesn't. */
  children?: ReactNode;
}

/** "₱300" rather than "₱300.00": upgrade prices are whole pesos. */
const pesos = (cents: number) => formatPrice(cents).replace(/\.00$/, "");

/**
 * Wraps the editor for a package module. When the website's package lacks the
 * module, the editor stays visible (so couples see what they'd get) but can't be
 * used, under a gentle prompt to upgrade.
 */
export default function ModuleLock({ config, module, onUpgrade, label, children }: Props) {
  if (hasModule(config, module)) return <>{children}</>;

  const to = tierFor(module);
  const price = pesos(upgradePrice(configTier(config), to));
  const name = label ?? MODULE_LABELS[module];

  return (
    <div className="space-y-5">
      <div
        className="flex flex-col gap-3 px-4 py-3.5 @md:flex-row @md:items-center @md:justify-between"
        style={{ background: "var(--color-primary-container)", borderRadius: "var(--radius-md)" }}
      >
        <p className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: "var(--color-on-surface)" }}>
          <Lock size={14} aria-hidden className="mt-[3px] shrink-0" style={{ color: "var(--color-primary)" }} />
          <span>
            {name} comes with {TIER_INFO[to].label}.{" "}
            <span style={{ color: "var(--color-on-surface-variant)" }}>You only pay the difference.</span>
          </span>
        </p>
        <ButtonSecondary size="sm" className="shrink-0 self-start @md:self-auto" onClick={() => onUpgrade(to)}>
          Upgrade for {price}
        </ButtonSecondary>
      </div>
      {children && (
        <div inert style={{ opacity: 0.5 }}>
          {children}
        </div>
      )}
    </div>
  );
}
