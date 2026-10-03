import type { GuestGroup, GuestListEntry, WeddingConfig } from "@/types/wedding";

/**
 * Sample guests, groups and private content for the public template preview,
 * so shoppers can see what Personalized Invitations look like before buying.
 * Nothing here is persisted; preview configs are demo ids.
 */
export function samplePersonalization(config: WeddingConfig): {
  config: WeddingConfig;
  guests: GuestListEntry[];
  groups: GuestGroup[];
  defaultCode: string;
} {
  const createdAt = "2026-01-01T00:00:00.000Z";
  const weddingId = config.id;
  const groups: GuestGroup[] = [
    { id: "sample-grp-family", weddingId, name: "Family", inviteCode: "SAMPFAM2", createdAt },
    { id: "sample-grp-entourage", weddingId, name: "Entourage", inviteCode: "SAMPENT2", createdAt },
  ];
  const guest = (id: string, name: string, code: string, groupIds: string[], partySize = 1): GuestListEntry => ({
    id,
    weddingId,
    name,
    partySize,
    status: "invited",
    groupIds,
    inviteCode: code,
    createdAt,
  });
  const guests: GuestListEntry[] = [
    guest("sample-gst-maria", "Maria Santos", "SAMPMAR2", ["sample-grp-family"], 4),
    guest("sample-gst-paolo", "Paolo Reyes", "SAMPPAU2", ["sample-grp-entourage"]),
    guest("sample-gst-jon", "Jon Lim", "SAMPJUN2", []),
  ];

  const dayBefore = (() => {
    const d = new Date(`${config.weddingDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return undefined;
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  return {
    config: {
      ...config,
      tier: "personalized",
      inviteGreeting: { enabled: true, message: "We saved a seat just for you." },
      privateSections: [
        {
          id: "sample-ps-family",
          kind: "text",
          title: "A note for family",
          body: "Please come an hour early for family photos by the garden steps. Lola has already claimed the front row.",
          audience: { groupIds: ["sample-grp-family"], guestIds: [] },
        },
        {
          id: "sample-ps-rehearsal",
          kind: "event",
          title: "Rehearsal dinner",
          body: "A relaxed dinner for the entourage after the walk-through. Smart casual.",
          eventDate: dayBefore,
          eventTime: "6:30 PM",
          eventLocation: config.venueCity || config.venueName,
          audience: { groupIds: ["sample-grp-entourage"], guestIds: [] },
        },
      ],
    },
    guests,
    groups,
    defaultCode: "SAMPMAR2",
  };
}
