"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/cart";
import { WeddingTemplate } from "@/types/template";
import type { Tier } from "@/types/wedding";
import { PERSONALIZED_ADDON_CENTS, resolveTier, tierPrice } from "@/lib/tiers";

export function cartItemPrice(item: CartItem): number {
  return item.kind === "upgrade" ? PERSONALIZED_ADDON_CENTS : tierPrice(item.template.price, item.tier);
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** Add a template at a tier. Defaults to Personalized; re-adding updates the tier. */
  addItem: (template: WeddingTemplate, tier?: Tier) => void;
  /** Add the Personalized Invitations add-on for a website already owned. */
  addUpgrade: (weddingId: string, template: WeddingTemplate, weddingLabel: string) => void;
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

      addItem: (template, requestedTier = "personalized") => {
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

      addUpgrade: (weddingId, template, weddingLabel) => {
        const id = `upgrade:${weddingId}`;
        if (get().items.some((i) => i.id === id)) return;
        set((state) => ({
          items: [
            ...state.items,
            {
              id,
              kind: "upgrade",
              templateId: template.id,
              template,
              tier: "personalized",
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
      version: 1,
      // v0 items had no id/kind/tier. Treat them as Personalized template purchases.
      migrate: (persisted: unknown) => {
        const state = (persisted ?? {}) as { items?: Partial<CartItem>[] };
        return {
          ...state,
          items: (state.items ?? []).map((i) => ({
            ...i,
            id: i.id ?? i.templateId,
            kind: i.kind ?? "template",
            tier: i.tier ?? "personalized",
          })),
        } as CartState;
      },
    }
  )
);
