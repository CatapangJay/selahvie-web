"use client";

import { CartItem } from "@/types/cart";
import type { Tier } from "@/types/wedding";
import { cartItemPrice, useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { TIERS, TIER_INFO } from "@/lib/tiers";
import { X } from "lucide-react";
import Image from "next/image";

export default function CartItemCard({ item }: { item: CartItem }) {
  const { removeItem, setTier } = useCartStore();
  const isUpgrade = item.kind === "upgrade";
  const title = isUpgrade ? `${TIER_INFO[item.tier].label} upgrade` : item.template.name;

  return (
    <div
      className="flex gap-4"
      style={{
        background: "var(--color-surface-container)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--color-outline)",
        padding: "0.875rem",
      }}
    >
      {/* Preview thumbnail */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ width: 72, height: 56, borderRadius: "var(--radius-sm)" }}
      >
        <Image
          src={item.template.previewImage}
          alt={item.template.name}
          fill
          className="object-cover"
          sizes="72px"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--color-on-surface)" }}
          >
            {title}
          </p>
          <p className="mt-1 text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
            {isUpgrade
              ? `${TIER_INFO[item.fromTier ?? "essential"].label} to ${TIER_INFO[item.tier].label} for ${item.weddingLabel ?? item.template.name}`
              : `${TIER_INFO[item.tier].label} plan`}
          </p>
          {!isUpgrade && !item.template.personalizedOnly && (
            <label className="mt-1 flex min-h-[28px] items-center gap-2 text-xs" style={{ color: "var(--color-on-surface-muted)" }}>
              <span className="sr-only">Package for {title}</span>
              <select
                value={item.tier}
                onChange={(e) => setTier(item.id, e.target.value as Tier)}
                className="bg-transparent text-xs underline underline-offset-2"
                style={{ color: "var(--color-primary)" }}
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {TIER_INFO[t].label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <p
          className="font-serif text-sm"
          style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 300, color: "var(--color-primary)" }}
        >
          {formatPrice(cartItemPrice(item))}
        </p>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.id)}
        className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-start justify-end transition-opacity hover:opacity-60"
        style={{ color: "var(--color-on-surface-muted)" }}
        aria-label={`Remove ${title} from cart`}
      >
        <X size={16} strokeWidth={1.25} />
      </button>
    </div>
  );
}
