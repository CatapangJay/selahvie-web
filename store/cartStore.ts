"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/cart";
import { WeddingTemplate } from "@/types/template";
import type { Tier } from "@/types/wedding";
import { normalizeTier, resolveTier, tierPrice, upgradePrice } from "@/lib/tiers";

export function cartItemPrice(item: CartItem): number {
  return item.kind === "upgrade"
    ? upgradePrice(item.fromTier ?? "essential", item.tier)
    : tierPrice(item.template.price, item.tier);
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** Add a template at a tier. Defaults to Premium; re-adding updates the tier. */
  addItem: (template: WeddingTemplate, tier?: Tier) => void;
  /** Move a website already owned from `fromTier` to `toTier`. Re-adding replaces the target. */
  addUpgrade: (weddingId: string, template: WeddingTemplate, weddingLabel: string, fromTier: Tier, toTier: Tier) => void;
  setTier: (itemId: string, tier: Tier) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  isInCart: (templateId: string) => boolean;
  getItem: (itemId: string) => CartItem | undefined;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (template, requestedTier = "premium") => {
        const tier = resolveTier(template, requestedTier);
        const exists = get().items.find((i) => i.kind === "template" && i.templateId === template.id);
        if (exists) {
          get().setTier(exists.id, tier);
          set({ isOpen: true });
          return;
        }
        set((state) => ({
          items: [
            ...state.items,
            {
              id: template.id,
              kind: "template",
              templateId: template.id,
              template,
              tier,
              addedAt: new Date().toISOString(),
            },
          ],
          isOpen: true,
        }));
      },

      addUpgrade: (weddingId, template, weddingLabel, fromTier, toTier) => {
        const id = `upgrade:${weddingId}`;
        set((state) => ({
          items: [
            ...state.items.filter((i) => i.id !== id),
            {
              id,
              kind: "upgrade",
              templateId: template.id,
              template,
              tier: toTier,
              fromTier,
              weddingId,
              weddingLabel,
              addedAt: new Date().toISOString(),
            },
          ],
        }));
      },

      setTier: (itemId, tier) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId && i.kind === "template" ? { ...i, tier: resolveTier(i.template, tier) } : i
          ),
        })),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      isInCart: (templateId) =>
        get().items.some((i) => i.kind === "template" && i.templateId === templateId),

      getItem: (itemId) => get().items.find((i) => i.id === itemId),

      total: () => get().items.reduce((sum, i) => sum + cartItemPrice(i), 0),

      itemCount: () => get().items.length,
    }),
    {
      name: "selahvie-cart",
      version: 2,
      // v0 items had no id/kind/tier (treated as Personalized). v1 tiers were "base" / "personalized":
      // a Base template keeps its price as Essential; v1 upgrades (base → personalized) are now classic → premium.
      migrate: (persisted: unknown) => {
        const state = (persisted ?? {}) as { items?: Partial<CartItem>[] };
        return {
          ...state,
          items: (state.items ?? []).map((i) => {
            const kind = i.kind ?? "template";
            return {
              ...i,
              id: i.id ?? i.templateId,
              kind,
              tier: kind === "template" && i.tier === ("base" as string) ? "essential" : normalizeTier(i.tier ?? "personalized"),
              ...(kind === "upgrade" ? { fromTier: normalizeTier(i.fromTier ?? "base") } : {}),
            };
          }),
        } as CartState;
      },
    }
  )
);
