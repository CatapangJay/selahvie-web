"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WeddingConfig } from "@/types/wedding";

interface WeddingState {
  configs: Record<string, WeddingConfig>;
  updateConfig: (id: string, data: Partial<WeddingConfig>) => void;
  publishConfig: (id: string) => void;
  getConfig: (id: string) => WeddingConfig | undefined;
  createConfig: (templateId: string) => string;
}

const defaultConfig = (id: string, templateId: string): WeddingConfig => ({
  id,
  templateId,
  slug: id,
  status: "draft",
  partner1Name: "",
  partner2Name: "",
  weddingDate: "",
  venueName: "",
  venueAddress: "",
  venueCity: "",
  primaryColor: "#7c5454",
  accentColor: "#c99999",
  themePresetId: "",
  heroImageUrl: `https://picsum.photos/seed/${id}-hero/1200/800`,
  galleryImageUrls: [
    `https://picsum.photos/seed/${id}-g1/800/800`,
    `https://picsum.photos/seed/${id}-g2/800/800`,
    `https://picsum.photos/seed/${id}-g3/800/800`,
    `https://picsum.photos/seed/${id}-g4/800/800`,
  ],
  coupleStory: "",
  rsvpDeadline: "",
  mealOptions: ["Chicken", "Fish", "Vegetarian"],
  allowPlusOne: true,
  customQuestions: [],
  musicTrackId: "none",
  musicCustomUrl: "",
});

export const useWeddingStore = create<WeddingState>()(
  persist(
    (set, get) => ({
      configs: {},

      createConfig: (templateId) => {
        const id = `w-${Date.now()}`;
        set((state) => ({
          configs: { ...state.configs, [id]: defaultConfig(id, templateId) },
        }));
        return id;
      },

      updateConfig: (id, data) =>
        set((state) => ({
          configs: {
            ...state.configs,
            [id]: { ...state.configs[id], ...data },
          },
        })),

      publishConfig: (id) =>
        set((state) => ({
          configs: {
            ...state.configs,
            [id]: { ...state.configs[id], status: "published" },
          },
        })),

      getConfig: (id) => get().configs[id],
    }),
    { name: "selahvie-weddings", version: 1 }
  )
);
