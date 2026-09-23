"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[]; // favorited template ids
  toggle: (templateId: string) => void;
  isFavorite: (templateId: string) => boolean;
  count: () => number;
}

/**
 * Template favorites (discovery & delight). Persisted to localStorage so a
 * couple's saved templates survive across visits. Marketplace-only concept;
 * unrelated to purchased/customized WeddingConfigs.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (templateId) =>
        set((state) => ({
          ids: state.ids.includes(templateId)
            ? state.ids.filter((id) => id !== templateId)
            : [...state.ids, templateId],
        })),
      isFavorite: (templateId) => get().ids.includes(templateId),
      count: () => get().ids.length,
    }),
    { name: "selahvie-favorites" }
  )
);
