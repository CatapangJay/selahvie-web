"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WeddingConfig, RSVPEntry, GuestListEntry } from "@/types/wedding";

/** Summary of RSVP activity for one wedding, derived from stored entries. */
export interface RsvpSummary {
  total: number;
  attending: number;
  declined: number;
  guestCount: number; // attending heads incl. plus-ones
  mealTally: Record<string, number>;
}

interface WeddingState {
  configs: Record<string, WeddingConfig>;
  rsvps: RSVPEntry[];
  guests: GuestListEntry[];

  // Config lifecycle
  updateConfig: (id: string, data: Partial<WeddingConfig>) => void;
  publishConfig: (id: string) => void;
  getConfig: (id: string) => WeddingConfig | undefined;
  createConfig: (templateId: string) => string;

  // RSVP (written by public wedding sites, read by the dashboard)
  addRsvp: (entry: Omit<RSVPEntry, "id" | "submittedAt">) => void;
  getRsvps: (weddingId: string) => RSVPEntry[];
  getRsvpSummary: (weddingId: string) => RsvpSummary;

  // Guest list (managed from the dashboard)
  addGuest: (entry: Omit<GuestListEntry, "id" | "createdAt">) => void;
  updateGuest: (id: string, data: Partial<GuestListEntry>) => void;
  removeGuest: (id: string) => void;
  getGuests: (weddingId: string) => GuestListEntry[];
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
  primaryColor: "#A75463",
  accentColor: "#C69D63",
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
  registryLinks: [],
  travel: { accommodations: "", directions: "", notes: "" },
  faq: [],
  weddingParty: [],
  schedule: [],
});

// Small unique-id helper. Date.now + counter avoids collisions within a tick.
let seq = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const useWeddingStore = create<WeddingState>()(
  persist(
    (set, get) => ({
      configs: {},
      rsvps: [],
      guests: [],

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

      // ─── RSVP ───
      addRsvp: (entry) =>
        set((state) => ({
          rsvps: [
            ...state.rsvps,
            { ...entry, id: uid("rsvp"), submittedAt: new Date().toISOString() },
          ],
        })),

      getRsvps: (weddingId) =>
        get().rsvps.filter((r) => r.weddingId === weddingId),

      getRsvpSummary: (weddingId) => {
        const entries = get().rsvps.filter((r) => r.weddingId === weddingId);
        const summary: RsvpSummary = {
          total: entries.length,
          attending: 0,
          declined: 0,
          guestCount: 0,
          mealTally: {},
        };
        for (const r of entries) {
          if (r.attending) {
            summary.attending += 1;
            summary.guestCount += 1 + (r.plusOne ? 1 : 0);
            if (r.mealChoice) {
              summary.mealTally[r.mealChoice] = (summary.mealTally[r.mealChoice] ?? 0) + 1;
            }
          } else {
            summary.declined += 1;
          }
        }
        return summary;
      },

      // ─── Guest list ───
      addGuest: (entry) =>
        set((state) => ({
          guests: [
            ...state.guests,
            { ...entry, id: uid("guest"), createdAt: new Date().toISOString() },
          ],
        })),

      updateGuest: (id, data) =>
        set((state) => ({
          guests: state.guests.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),

      removeGuest: (id) =>
        set((state) => ({
          guests: state.guests.filter((g) => g.id !== id),
        })),

      getGuests: (weddingId) =>
        get().guests.filter((g) => g.weddingId === weddingId),
    }),
    {
      name: "selahvie-weddings",
      version: 2,
      // v1 stored only `configs`. Preserve them and seed the new slices so
      // existing users don't lose their saved websites on upgrade.
      migrate: (persisted: unknown, version) => {
        const state = (persisted ?? {}) as Partial<WeddingState>;
        if (version < 2) {
          return { ...state, rsvps: state.rsvps ?? [], guests: state.guests ?? [] } as WeddingState;
        }
        return state as WeddingState;
      },
    }
  )
);
