import { randomUUID } from "node:crypto";
import { generateInviteCode } from "@/lib/invitations";
import { defaultWeddingConfig } from "@/lib/weddingDefaults";
import type { WeddingBundle } from "./server";
import type { GuestGroup, GuestListEntry, WeddingConfig } from "@/types/wedding";

/**
 * Content for the demo account: a published Personalized site with a small
 * guest list and private sections, plus a fresh Base draft.
 */
export function demoBundles(): WeddingBundle[] {
  const now = new Date().toISOString();
  const publishedId = randomUUID();
  const codes = new Set<string>();
  const code = () => {
    const c = generateInviteCode(codes);
    codes.add(c);
    return c;
  };

  const family: GuestGroup = { id: randomUUID(), weddingId: publishedId, name: "Family", inviteCode: code(), createdAt: now };
  const entourage: GuestGroup = { id: randomUUID(), weddingId: publishedId, name: "Entourage", inviteCode: code(), createdAt: now };
  const guest = (name: string, partySize: number, groupIds: string[], email?: string): GuestListEntry => ({
    id: randomUUID(),
    weddingId: publishedId,
    name,
    email,
    partySize,
    status: "invited",
    groupIds,
    inviteCode: code(),
    createdAt: now,
  });

  const published: WeddingConfig = {
    ...defaultWeddingConfig(publishedId, "t8", "personalized"),
    slug: "alex-and-sam",
    status: "published",
    partner1Name: "Alex",
    partner2Name: "Sam",
    weddingDate: "2026-11-14",
    venueName: "The Willow Grove Estate",
    venueAddress: "24 Meadow Lane",
    venueCity: "Tagaytay City",
    primaryColor: "#d4af37",
    accentColor: "#7ec8a4",
    themePresetId: "eg1",
    coupleStory:
      "We met on a rainy afternoon and never really said goodbye. Two years of long walks and longer dinners later, here we are — ready for the rest of it.",
    rsvpDeadline: "2026-10-01",
    inviteGreeting: { enabled: true, message: "We saved a seat just for you." },
    privateSections: [
      {
        id: "demo-ps-1",
        kind: "event",
        title: "Rehearsal dinner",
        body: "An intimate dinner the night before, just us and the people closest to us.",
        eventDate: "2026-11-13",
        eventTime: "7:00 PM",
        eventLocation: "The Glasshouse, Willow Grove Estate",
        audience: { groupIds: [entourage.id], guestIds: [] },
      },
      {
        id: "demo-ps-2",
        kind: "text",
        title: "A note for family",
        body: "Lola's table is reserved at the front. Please arrive by 3:30 PM for family photos.",
        audience: { groupIds: [family.id], guestIds: [] },
      },
    ],
  };

  const draftId = randomUUID();
  const draft: WeddingConfig = { ...defaultWeddingConfig(draftId, "t1"), partner1Name: "Alex", partner2Name: "Sam" };

  return [
    {
      config: published,
      groups: [family, entourage],
      guests: [
        guest("Maria Santos", 2, [family.id], "maria@example.com"),
        guest("Paolo Reyes", 1, [entourage.id]),
        guest("Bea Cruz", 1, [entourage.id, family.id]),
        guest("Jon Lim", 1, []),
      ],
      rsvps: [],
      guestbook: [],
    },
    { config: draft, groups: [], guests: [], rsvps: [], guestbook: [] },
  ];
}
