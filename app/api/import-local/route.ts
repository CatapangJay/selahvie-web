import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { templates } from "@/data/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { insertWeddingBundles, requireUser, type WeddingBundle } from "@/lib/db/server";
import { remapAudience } from "@/lib/db/mappers";
import { generateInviteCode } from "@/lib/invitations";
import { defaultWeddingConfig } from "@/lib/weddingDefaults";
import type {
  Audience,
  GuestbookEntry,
  GuestGroup,
  GuestListEntry,
  PrivateSection,
  RSVPEntry,
  WeddingConfig,
} from "@/types/wedding";

export const runtime = "nodejs";

/**
 * One-time move of websites saved in this browser (before accounts lived in
 * Supabase) into the signed-in account. Only websites tagged with the user's
 * own email are taken; every id is replaced with a fresh UUID.
 */

const MAX_BODY_BYTES = 4 * 1024 * 1024;
const LIMITS = { configs: 20, groups: 500, guests: 5000, rsvps: 5000, guestbook: 5000 };
const GUEST_STATUSES = new Set(["invited", "attending", "declined", "pending"]);
const CODE = /^[A-Z0-9]{6,40}$/;

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.slice(0, max) : undefined);
const bool = (v: unknown) => (typeof v === "boolean" ? v : undefined);
const strList = (v: unknown, max = 100) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, max) : undefined;
const list = <T,>(v: unknown, max = 200) => (Array.isArray(v) ? (v.slice(0, max) as T[]) : undefined);
const iso = (v: unknown) => {
  const t = typeof v === "string" ? Date.parse(v) : NaN;
  return Number.isNaN(t) ? new Date().toISOString() : new Date(t).toISOString();
};
const rows = (v: unknown, max: number) => (Array.isArray(v) ? v.filter(isObj).slice(0, max) : []);

function audienceOf(v: unknown): Audience {
  return isObj(v) ? { groupIds: strList(v.groupIds) ?? [], guestIds: strList(v.guestIds) ?? [] } : { groupIds: [], guestIds: [] };
}

/** Keep only fields of the right type; anything missing comes from a fresh website. */
function coerceConfig(raw: Raw, id: string, templateId: string): WeddingConfig {
  const tier = raw.tier === "personalized" ? "personalized" : "base";
  const base = defaultWeddingConfig(id, templateId, tier);
  const pick = <K extends keyof WeddingConfig>(key: K, value: WeddingConfig[K] | undefined) =>
    value === undefined ? {} : { [key]: value };
  const slug = str(raw.slug, 120);
  return {
    ...base,
    ...pick("slug", slug && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ? slug : undefined),
    ...pick("status", raw.status === "published" ? "published" : "draft"),
    ...pick("partner1Name", str(raw.partner1Name, 200)),
    ...pick("partner2Name", str(raw.partner2Name, 200)),
    ...pick("weddingDate", str(raw.weddingDate, 10)),
    ...pick("venueName", str(raw.venueName, 300)),
    ...pick("venueAddress", str(raw.venueAddress, 300)),
    ...pick("venueCity", str(raw.venueCity, 200)),
    ...pick("primaryColor", str(raw.primaryColor, 7)),
    ...pick("accentColor", str(raw.accentColor, 7)),
    ...pick("themePresetId", str(raw.themePresetId, 60)),
    ...pick("fontPresetId", str(raw.fontPresetId, 60)),
    ...pick("heroImageUrl", str(raw.heroImageUrl, 2000)),
    ...pick("galleryImageUrls", strList(raw.galleryImageUrls, 60)),
    ...pick("coupleStory", str(raw.coupleStory, 10000)),
    ...pick("rsvpDeadline", str(raw.rsvpDeadline, 10)),
    ...pick("mealOptions", strList(raw.mealOptions, 30)),
    ...pick("allowPlusOne", bool(raw.allowPlusOne)),
    ...pick("customQuestions", strList(raw.customQuestions, 30)),
    ...pick("musicTrackId", str(raw.musicTrackId, 60)),
    ...pick("musicCustomUrl", str(raw.musicCustomUrl, 2000)),
    ...pick("registryLinks", list(raw.registryLinks)),
    ...pick("travel", isObj(raw.travel) ? (raw.travel as unknown as WeddingConfig["travel"]) : undefined),
    ...pick("faq", list(raw.faq)),
    ...pick("weddingParty", list(raw.weddingParty)),
    ...pick("entourageLayout", isObj(raw.entourageLayout) ? (raw.entourageLayout as WeddingConfig["entourageLayout"]) : undefined),
    ...pick("schedule", list(raw.schedule)),
    ...pick("sectionVisibility", isObj(raw.sectionVisibility) ? (raw.sectionVisibility as WeddingConfig["sectionVisibility"]) : undefined),
    ...pick("inviteGreeting", isObj(raw.inviteGreeting) ? (raw.inviteGreeting as unknown as WeddingConfig["inviteGreeting"]) : undefined),
    ...pick("inviteLookupEnabled", bool(raw.inviteLookupEnabled)),
    ...pick("openInviteMatching", bool(raw.openInviteMatching)),
  };
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Too much data to import." }, { status: 413 });
  }
  const body = (await request.json().catch(() => null)) as Raw | null;
  if (!isObj(body)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const rawConfigs = rows(body.configs, LIMITS.configs).filter(
    (c) => typeof c.ownerEmail === "string" && c.ownerEmail.trim().toLowerCase() === user.email
  );
  const rawGroups = rows(body.groups, LIMITS.groups);
  const rawGuests = rows(body.guests, LIMITS.guests);
  const rawRsvps = rows(body.rsvps, LIMITS.rsvps);
  const rawGuestbook = rows(body.guestbook, LIMITS.guestbook);

  // Invite codes are unique across every website; replace any already taken.
  const admin = createAdminClient();
  const offered = [...rawGroups, ...rawGuests]
    .map((r) => str(r.inviteCode, 40))
    .filter((c): c is string => Boolean(c && CODE.test(c)));
  const taken = new Set<string>();
  for (let i = 0; i < offered.length; i += 200) {
    const chunk = offered.slice(i, i + 200);
    const [g, gr] = await Promise.all([
      admin.from("guests").select("invite_code").in("invite_code", chunk),
      admin.from("guest_groups").select("invite_code").in("invite_code", chunk),
    ]);
    if (g.error || gr.error) return NextResponse.json({ error: "Couldn't import right now." }, { status: 502 });
    for (const r of [...(g.data ?? []), ...(gr.data ?? [])]) taken.add(r.invite_code as string);
  }
  const code = (v: unknown) => {
    const c = str(v, 40);
    const next = c && CODE.test(c) && !taken.has(c) ? c : generateInviteCode(taken);
    taken.add(next);
    return next;
  };

  const imported: { oldId: string; newId: string }[] = [];
  let failed = 0;

  for (const raw of rawConfigs) {
    const oldId = str(raw.id, 200);
    const templateId = str(raw.templateId, 60);
    if (!oldId || !templateId || !templates.some((t) => t.id === templateId)) {
      failed += 1;
      continue;
    }
    const weddingId = randomUUID();
    const groupIds = new Map<string, string>();
    const guestIds = new Map<string, string>();

    const groups: GuestGroup[] = rawGroups
      .filter((g) => g.weddingId === oldId && str(g.name, 200)?.trim() && typeof g.id === "string")
      .map((g) => {
        const id = randomUUID();
        groupIds.set(g.id as string, id);
        return { id, weddingId, name: (g.name as string).trim().slice(0, 200), inviteCode: code(g.inviteCode), createdAt: iso(g.createdAt) };
      });

    const guests: GuestListEntry[] = rawGuests
      .filter((g) => g.weddingId === oldId && str(g.name, 200)?.trim() && typeof g.id === "string")
      .map((g) => {
        const id = randomUUID();
        guestIds.set(g.id as string, id);
        return {
          id,
          weddingId,
          name: (g.name as string).trim().slice(0, 200),
          email: str(g.email, 320),
          partySize: typeof g.partySize === "number" ? g.partySize : 1,
          status: (GUEST_STATUSES.has(g.status as string) ? g.status : "invited") as GuestListEntry["status"],
          note: str(g.note, 2000),
          groupIds: [...new Set((strList(g.groupIds) ?? []).flatMap((x) => groupIds.get(x) ?? []))],
          inviteCode: code(g.inviteCode),
          createdAt: iso(g.createdAt),
        };
      });

    const config = coerceConfig(raw, weddingId, templateId);
    config.privateSections = (list<Raw>(raw.privateSections, 50) ?? []).filter(isObj).map(
      (s) => ({ ...(s as unknown as PrivateSection), audience: remapAudience(audienceOf(s.audience), groupIds, guestIds) })
    );
    config.sectionAudiences = Object.fromEntries(
      Object.entries(isObj(raw.sectionAudiences) ? raw.sectionAudiences : {}).map(([k, a]) => [
        k,
        remapAudience(audienceOf(a), groupIds, guestIds),
      ])
    );

    const rsvps: RSVPEntry[] = rawRsvps
      .filter((r) => r.weddingId === oldId && str(r.guestName, 200)?.trim() && typeof r.attending === "boolean")
      .map((r) => ({
        id: randomUUID(),
        weddingId,
        guestName: (r.guestName as string).trim().slice(0, 200),
        email: str(r.email, 320),
        attending: r.attending as boolean,
        mealChoice: str(r.mealChoice, 200),
        plusOne: r.plusOne === true,
        plusOneName: str(r.plusOneName, 200),
        additionalGuests: typeof r.additionalGuests === "number" ? r.additionalGuests : undefined,
        additionalGuestNames: strList(r.additionalGuestNames, 50),
        message: str(r.message, 2000),
        guestId: typeof r.guestId === "string" ? guestIds.get(r.guestId) : undefined,
        submittedAt: iso(r.submittedAt),
      }));

    const guestbook: GuestbookEntry[] = rawGuestbook
      .filter((e) => e.weddingId === oldId && str(e.name, 200)?.trim() && str(e.message, 2000)?.trim())
      .map((e) => ({
        id: randomUUID(),
        weddingId,
        name: e.name as string,
        message: e.message as string,
        createdAt: iso(e.createdAt),
      }));

    const bundle: WeddingBundle = { config, groups, guests, rsvps, guestbook };
    try {
      await insertWeddingBundles(admin, user.id, [bundle]);
      imported.push({ oldId, newId: weddingId });
    } catch (e) {
      console.error("[api/import-local] wedding import failed:", e);
      failed += 1;
    }
  }

  return NextResponse.json({ imported, failed });
}
