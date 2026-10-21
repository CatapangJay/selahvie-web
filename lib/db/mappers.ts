/**
 * Conversions between database rows (db/migrations) and the app's types
 * (types/wedding.ts). Pure functions, shared by the browser store and the
 * server routes.
 */
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/lib/weddingDefaults";
import type {
  Audience,
  GuestbookEntry,
  GuestGroup,
  GuestListEntry,
  GuestSide,
  InviteGreeting,
  PrivateSection,
  RSVPEntry,
  SeatingPlan,
  Tier,
  TravelInfo,
  WeddingConfig,
} from "@/types/wedding";

// ─── Row shapes ──────────────────────────────────────────────────────────────

interface WeddingSectionsJson {
  registryLinks?: WeddingConfig["registryLinks"];
  travel?: TravelInfo;
  faq?: WeddingConfig["faq"];
  weddingParty?: WeddingConfig["weddingParty"];
  schedule?: WeddingConfig["schedule"];
}

export interface WeddingRow {
  id: string;
  owner_id: string;
  template_id: string;
  slug: string;
  status: WeddingConfig["status"];
  tier: Tier;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string | null;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  primary_color: string | null;
  accent_color: string | null;
  theme_preset_id: string | null;
  font_preset_id: string | null;
  hero_image_url: string | null;
  gallery_image_urls: string[];
  couple_story: string;
  rsvp_deadline: string | null;
  meal_options: string[];
  allow_plus_one: boolean;
  custom_questions: string[];
  music_track_id: string;
  music_custom_url: string | null;
  sections: WeddingSectionsJson;
  section_visibility: NonNullable<WeddingConfig["sectionVisibility"]>;
  section_audiences: NonNullable<WeddingConfig["sectionAudiences"]>;
  private_sections: PrivateSection[];
  invite_greeting: InviteGreeting | null;
  invite_lookup_enabled: boolean;
  open_invite_matching: boolean;
  /** Added in 0010; optional so inserts work before that migration runs. */
  seating_plan?: Partial<SeatingPlan>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Columns the owner may write (everything but identity, entitlements and timestamps). */
export type WeddingColumns = Omit<WeddingRow, "id" | "owner_id" | "tier" | "published_at" | "created_at" | "updated_at">;

export interface GuestRow {
  id: string;
  wedding_id: string;
  name: string;
  email: string | null;
  party_size: number;
  status: GuestListEntry["status"];
  /** Added in migration 0011. Absent on databases that haven't run it. */
  side?: GuestSide | null;
  note: string | null;
  invite_code: string;
  created_at: string;
}

export interface GroupRow {
  id: string;
  wedding_id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface MemberRow {
  wedding_id: string;
  group_id: string;
  guest_id: string;
}

export interface RsvpRow {
  id: string;
  wedding_id: string;
  guest_id: string | null;
  guest_name: string;
  email: string | null;
  attending: boolean;
  meal_choice: string | null;
  plus_one: boolean;
  plus_one_name: string | null;
  additional_guests: number;
  additional_guest_names: string[];
  message: string | null;
  submitted_at: string;
}

export interface GuestbookRow {
  id: string;
  wedding_id: string;
  name: string;
  message: string;
  created_at: string;
}

// ─── Weddings ────────────────────────────────────────────────────────────────

const HEX = /^#[0-9A-Fa-f]{6}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMPTY_TRAVEL: TravelInfo = { accommodations: "", directions: "", notes: "" };

const dateOrNull = (v: string | undefined) => (v && ISO_DATE.test(v) ? v : null);
const hexOrNull = (v: string | undefined) => (v && HEX.test(v) ? v : null);
const textOrNull = (v: string | undefined) => (v?.trim() ? v.trim() : null);

export function fromWeddingRow(row: WeddingRow, ownerEmail?: string): WeddingConfig {
  const sections = row.sections ?? {};
  return {
    id: row.id,
    templateId: row.template_id,
    slug: row.slug,
    status: row.status,
    ownerEmail,
    tier: row.tier,
    partner1Name: row.partner1_name,
    partner2Name: row.partner2_name,
    weddingDate: row.wedding_date ?? "",
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    venueCity: row.venue_city,
    primaryColor: row.primary_color ?? DEFAULT_PRIMARY_COLOR,
    accentColor: row.accent_color ?? DEFAULT_ACCENT_COLOR,
    themePresetId: row.theme_preset_id ?? "",
    heroImageUrl: row.hero_image_url ?? "",
    galleryImageUrls: row.gallery_image_urls ?? [],
    coupleStory: row.couple_story,
    rsvpDeadline: row.rsvp_deadline ?? "",
    mealOptions: row.meal_options ?? [],
    allowPlusOne: row.allow_plus_one,
    customQuestions: row.custom_questions ?? [],
    musicTrackId: row.music_track_id,
    musicCustomUrl: row.music_custom_url ?? "",
    registryLinks: sections.registryLinks ?? [],
    travel: sections.travel ?? EMPTY_TRAVEL,
    faq: sections.faq ?? [],
    weddingParty: sections.weddingParty ?? [],
    schedule: sections.schedule ?? [],
    fontPresetId: row.font_preset_id ?? undefined,
    sectionVisibility: row.section_visibility ?? {},
    privateSections: row.private_sections ?? [],
    sectionAudiences: row.section_audiences ?? {},
    inviteGreeting: row.invite_greeting ?? undefined,
    inviteLookupEnabled: row.invite_lookup_enabled,
    openInviteMatching: row.open_invite_matching,
    seatingPlan: {
      tables: row.seating_plan?.tables ?? [],
      assignments: row.seating_plan?.assignments ?? {},
      sides: row.seating_plan?.sides ?? {},
    },
  };
}

export function weddingColumns(c: WeddingConfig): WeddingColumns {
  return {
    template_id: c.templateId,
    slug: c.slug,
    status: c.status,
    partner1_name: c.partner1Name ?? "",
    partner2_name: c.partner2Name ?? "",
    wedding_date: dateOrNull(c.weddingDate),
    venue_name: c.venueName ?? "",
    venue_address: c.venueAddress ?? "",
    venue_city: c.venueCity ?? "",
    primary_color: hexOrNull(c.primaryColor),
    accent_color: hexOrNull(c.accentColor),
    theme_preset_id: textOrNull(c.themePresetId),
    font_preset_id: textOrNull(c.fontPresetId),
    hero_image_url: textOrNull(c.heroImageUrl),
    gallery_image_urls: c.galleryImageUrls ?? [],
    couple_story: c.coupleStory ?? "",
    rsvp_deadline: dateOrNull(c.rsvpDeadline),
    meal_options: c.mealOptions ?? [],
    allow_plus_one: Boolean(c.allowPlusOne),
    custom_questions: c.customQuestions ?? [],
    music_track_id: c.musicTrackId || "none",
    music_custom_url: textOrNull(c.musicCustomUrl),
    sections: {
      registryLinks: c.registryLinks ?? [],
      travel: c.travel ?? EMPTY_TRAVEL,
      faq: c.faq ?? [],
      weddingParty: c.weddingParty ?? [],
      schedule: c.schedule ?? [],
    },
    section_visibility: c.sectionVisibility ?? {},
    section_audiences: c.sectionAudiences ?? {},
    private_sections: c.privateSections ?? [],
    invite_greeting: c.inviteGreeting ?? null,
    invite_lookup_enabled: c.inviteLookupEnabled !== false,
    open_invite_matching: c.openInviteMatching !== false,
    ...(c.seatingPlan ? { seating_plan: c.seatingPlan } : {}),
  };
}

const COLUMN_FOR: Partial<Record<keyof WeddingConfig, keyof WeddingColumns>> = {
  templateId: "template_id",
  slug: "slug",
  status: "status",
  partner1Name: "partner1_name",
  partner2Name: "partner2_name",
  weddingDate: "wedding_date",
  venueName: "venue_name",
  venueAddress: "venue_address",
  venueCity: "venue_city",
  primaryColor: "primary_color",
  accentColor: "accent_color",
  themePresetId: "theme_preset_id",
  fontPresetId: "font_preset_id",
  heroImageUrl: "hero_image_url",
  galleryImageUrls: "gallery_image_urls",
  coupleStory: "couple_story",
  rsvpDeadline: "rsvp_deadline",
  mealOptions: "meal_options",
  allowPlusOne: "allow_plus_one",
  customQuestions: "custom_questions",
  musicTrackId: "music_track_id",
  musicCustomUrl: "music_custom_url",
  registryLinks: "sections",
  travel: "sections",
  faq: "sections",
  weddingParty: "sections",
  schedule: "sections",
  sectionVisibility: "section_visibility",
  sectionAudiences: "section_audiences",
  privateSections: "private_sections",
  inviteGreeting: "invite_greeting",
  inviteLookupEnabled: "invite_lookup_enabled",
  openInviteMatching: "open_invite_matching",
  seatingPlan: "seating_plan",
};

/**
 * Update payload for the fields that changed. Values come from the full config
 * because several fields share one JSON column. A colour that isn't a complete
 * hex code yet is left out, so the last valid colour stays saved.
 */
export function weddingPatch(config: WeddingConfig, changed: Iterable<keyof WeddingConfig>): Partial<WeddingColumns> {
  const all = weddingColumns(config);
  const patch: Partial<Record<keyof WeddingColumns, unknown>> = {};
  for (const key of changed) {
    const column = COLUMN_FOR[key];
    if (!column) continue;
    if ((column === "primary_color" || column === "accent_color") && all[column] === null) continue;
    patch[column] = all[column];
  }
  return patch as Partial<WeddingColumns>;
}

// ─── Guests, groups, membership ──────────────────────────────────────────────

const clampPartySize = (n: number) => Math.max(1, Math.min(50, Math.round(Number(n) || 1)));
const sideOrNull = (v: unknown): GuestSide | null => (v === "partner1" || v === "partner2" ? v : null);

export function fromGuestRow(row: GuestRow, groupIds: string[]): GuestListEntry {
  return {
    id: row.id,
    weddingId: row.wedding_id,
    name: row.name,
    email: row.email ?? undefined,
    partySize: row.party_size,
    status: row.status,
    side: sideOrNull(row.side) ?? undefined,
    note: row.note ?? undefined,
    groupIds,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
  };
}

export function guestRow(g: GuestListEntry): GuestRow {
  return {
    id: g.id,
    wedding_id: g.weddingId,
    name: g.name.trim(),
    email: textOrNull(g.email),
    party_size: clampPartySize(g.partySize),
    status: g.status,
    // Only sent when set, so inserts keep working before migration 0011 runs.
    ...(sideOrNull(g.side) ? { side: g.side } : {}),
    note: textOrNull(g.note),
    invite_code: g.inviteCode,
    created_at: g.createdAt,
  };
}

type GuestEditable = Pick<GuestRow, "name" | "email" | "party_size" | "status" | "side" | "note">;

/** Editable guest columns present in `data`. */
export function guestColumns(data: Partial<GuestListEntry>): Partial<GuestEditable> {
  const out: Partial<GuestEditable> = {};
  if ("name" in data && data.name !== undefined) out.name = data.name.trim();
  if ("email" in data) out.email = textOrNull(data.email);
  if ("partySize" in data && data.partySize !== undefined) out.party_size = clampPartySize(data.partySize);
  if ("status" in data && data.status !== undefined) out.status = data.status;
  if ("side" in data) out.side = sideOrNull(data.side);
  if ("note" in data) out.note = textOrNull(data.note);
  return out;
}

export function fromGroupRow(row: GroupRow): GuestGroup {
  return { id: row.id, weddingId: row.wedding_id, name: row.name, inviteCode: row.invite_code, createdAt: row.created_at };
}

export function groupRow(g: GuestGroup): GroupRow {
  return { id: g.id, wedding_id: g.weddingId, name: g.name.trim(), invite_code: g.inviteCode, created_at: g.createdAt };
}

export function memberRows(guest: Pick<GuestListEntry, "id" | "weddingId">, groupIds: string[]): MemberRow[] {
  return groupIds.map((groupId) => ({ wedding_id: guest.weddingId, group_id: groupId, guest_id: guest.id }));
}

/** guest id → group ids */
export function membershipIndex(rows: MemberRow[]): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const r of rows) {
    const list = index.get(r.guest_id);
    if (list) list.push(r.group_id);
    else index.set(r.guest_id, [r.group_id]);
  }
  return index;
}

// ─── RSVPs and guestbook ─────────────────────────────────────────────────────

export function fromRsvpRow(row: RsvpRow): RSVPEntry {
  return {
    id: row.id,
    weddingId: row.wedding_id,
    guestName: row.guest_name,
    email: row.email ?? undefined,
    attending: row.attending,
    mealChoice: row.meal_choice ?? undefined,
    plusOne: row.plus_one,
    plusOneName: row.plus_one_name ?? undefined,
    additionalGuests: row.additional_guests,
    additionalGuestNames: row.additional_guest_names?.length ? row.additional_guest_names : undefined,
    message: row.message ?? undefined,
    guestId: row.guest_id ?? undefined,
    submittedAt: row.submitted_at,
  };
}

/** Insert payload for a guest's response; the database fills id and submitted_at. */
export function rsvpInsert(entry: Omit<RSVPEntry, "id" | "submittedAt">): Omit<RsvpRow, "id" | "submitted_at"> {
  return {
    wedding_id: entry.weddingId,
    guest_id: entry.guestId ?? null,
    guest_name: entry.guestName.trim().slice(0, 200) || "Guest",
    email: textOrNull(entry.email),
    attending: entry.attending,
    meal_choice: textOrNull(entry.mealChoice),
    plus_one: entry.plusOne,
    plus_one_name: textOrNull(entry.plusOneName),
    additional_guests: Math.max(0, Math.min(50, entry.additionalGuests ?? (entry.plusOne ? 1 : 0))),
    additional_guest_names: entry.additionalGuestNames ?? [],
    message: entry.message?.trim().slice(0, 2000) || null,
  };
}

export function fromGuestbookRow(row: GuestbookRow): GuestbookEntry {
  return { id: row.id, weddingId: row.wedding_id, name: row.name, message: row.message, createdAt: row.created_at };
}

/** Remap an audience's ids (dropping any that don't map). */
export function remapAudience(a: Audience, groups: Map<string, string>, guests: Map<string, string>): Audience {
  return {
    groupIds: a.groupIds.flatMap((id) => groups.get(id) ?? []),
    guestIds: a.guestIds.flatMap((id) => guests.get(id) ?? []),
  };
}
