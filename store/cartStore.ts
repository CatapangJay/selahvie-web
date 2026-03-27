"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types/cart";
import { WeddingTemplate } from "@/types/template";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (template: WeddingTemplate) => void;
  removeItem: (templateId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  isInCart: (templateId: string) => boolean;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (template) => {
        const exists = get().items.find((i) => i.templateId === template.id);
        if (!exists) {
          set((state) => ({
            items: [
              ...state.items,
              {
                templateId: template.id,
                template,
                addedAt: new Date().toISOString(),
              },
            ],
            isOpen: true,
          }));
        }
      },

      removeItem: (templateId) =>
        set((state) => ({
          items: state.items.filter((i) => i.templateId !== templateId),
        })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      isInCart: (templateId) =>
        get().items.some((i) => i.templateId === templateId),

      total: () => get().items.reduce((sum, i) => sum + i.template.price, 0),

      itemCount: () => get().items.length,
    }),
    {
      name: "selahvie-cart",
    }
  )
);
