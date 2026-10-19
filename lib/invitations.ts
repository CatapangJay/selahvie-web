import type {
  Audience,
  AudienceSectionKey,
  GuestGroup,
  GuestListEntry,
  PrivateSection,
  WeddingConfig,
} from "@/types/wedding";

/** Query-string key that carries a guest or group invite code. */
export const INVITE_PARAM = "invite";

export const DEFAULT_GREETING = "We saved a seat just for you.";

// No 0/O/1/I/L so codes survive being read aloud or typed from a printed card.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

/**
 * Cryptographically random invite code (31^8 ≈ 8.5e11 combinations).
 * Rejection sampling keeps the distribution uniform across the alphabet.
 */
export function generateInviteCode(taken?: Set<string>): string {
  const limit = 256 - (256 % CODE_ALPHABET.length);
  for (;;) {
    const bytes = new Uint8Array(CODE_LENGTH * 2);
    crypto.getRandomValues(bytes);
    let code = "";
    for (const b of bytes) {
      if (b >= limit) continue;
      code += CODE_ALPHABET[b % CODE_ALPHABET.length];
      if (code.length === CODE_LENGTH) break;
    }
    if (code.length === CODE_LENGTH && !taken?.has(code)) return code;
  }
}

/** Canonical form for comparing typed codes ("abcd-efgh " → "ABCDEFGH"). */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Human-friendly display: ABCD-EFGH. */
export function formatCode(code: string): string {
  return code.length > 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

export function inviteUrl(origin: string, slugOrId: string, code: string): string {
  return `${origin}/wedding/${encodeURIComponent(slugOrId)}?${INVITE_PARAM}=${code}`;
}

// ─── Invitee ─────────────────────────────────────────────────────────────────

/** Who is viewing the site, resolved from an invite code, name lookup, or owner preview. */
export interface Invitee {
  kind: "guest" | "group";
  /** Guest id or group id. Used as a React key to reset forms on change. */
  id: string;
  code: string;
  displayName: string;
  groupIds: string[];
  guestId?: string;
  partySize?: number;
}

export function inviteeFromGuest(guest: GuestListEntry): Invitee {
  return {
    kind: "guest",
    id: guest.id,
    code: guest.inviteCode,
    displayName: guest.name,
    groupIds: guest.groupIds,
    guestId: guest.id,
    partySize: guest.partySize,
  };
}

export function inviteeFromGroup(group: GuestGroup): Invitee {
  return {
    kind: "group",
    id: group.id,
    code: group.inviteCode,
    displayName: group.name,
    groupIds: [group.id],
  };
}

export function findInviteeByCode(
  input: string,
  guests: GuestListEntry[],
  groups: GuestGroup[]
): Invitee | null {
  const code = normalizeCode(input);
  if (!code) return null;
  const guest = guests.find((g) => g.inviteCode === code);
  if (guest) return inviteeFromGuest(guest);
  const group = groups.find((g) => g.inviteCode === code);
  return group ? inviteeFromGroup(group) : null;
}

// ─── Audience + config personalization ──────────────────────────────────────

export const emptyAudience = (): Audience => ({ groupIds: [], guestIds: [] });

export function isAudienceEmpty(a?: Audience): boolean {
  return !a || (a.groupIds.length === 0 && a.guestIds.length === 0);
}

export function isInAudience(a: Audience | undefined, invitee: Invitee | null): boolean {
  if (!a || !invitee) return false;
  if (invitee.guestId && a.guestIds.includes(invitee.guestId)) return true;
  return invitee.groupIds.some((id) => a.groupIds.includes(id));
}

export function isPersonalized(config: Pick<WeddingConfig, "tier">): boolean {
  return config.tier === "personalized";
}

/** Most extra guests a single response can name (matches the party-size cap of 20). */
export const MAX_ADDITIONAL_GUESTS = 19;

/**
 * How many extra guests this viewer may bring. A guest identified on a Personalized
 * site gets `partySize - 1` whatever the site-wide plus-one setting, so a couple can
 * privilege specific guests with more seats (and keep everyone else solo). Everyone
 * else (Base sites, group links, unidentified visitors) gets the site-wide plus-one:
 * 1 if allowed, otherwise 0.
 */
export function plusOneAllowance(config: WeddingConfig, invitee: Invitee | null): number {
  if (isPersonalized(config) && invitee?.kind === "guest") return guestAllowance(invitee.partySize);
  return config.allowPlusOne ? 1 : 0;
}

/** Extra guests a guest with this party size may name. */
export function guestAllowance(partySize: number | undefined): number {
  return Math.max(0, Math.min(MAX_ADDITIONAL_GUESTS, (partySize ?? 1) - 1));
}

/**
 * The config as this invitee should see it: audience-restricted sections are
 * hidden for everyone outside the audience, and an identified guest's plus-one
 * field follows their party size (solo = none, larger = extra guests). Base-tier
 * configs pass through untouched.
 */
export function personalizeConfig(config: WeddingConfig, invitee: Invitee | null): WeddingConfig {
  if (!isPersonalized(config)) return config;
  const visibility = { ...(config.sectionVisibility ?? {}) };
  const audiences = Object.entries(config.sectionAudiences ?? {}) as [AudienceSectionKey, Audience][];
  for (const [key, audience] of audiences) {
    if (!isAudienceEmpty(audience) && !isInAudience(audience, invitee)) visibility[key] = false;
  }
  const identifiedGuest = invitee?.kind === "guest";
  return {
    ...config,
    sectionVisibility: visibility,
    allowPlusOne: identifiedGuest ? (invitee.partySize ?? 1) > 1 : config.allowPlusOne,
  };
}

export function visiblePrivateSections(config: WeddingConfig, invitee: Invitee | null): PrivateSection[] {
  if (!isPersonalized(config) || !invitee) return [];
  return (config.privateSections ?? []).filter((s) => isInAudience(s.audience, invitee));
}

export function greetingFor(
  config: WeddingConfig,
  invitee: Invitee | null
): { name: string; message: string } | null {
  if (!isPersonalized(config) || !invitee) return null;
  const greeting = config.inviteGreeting;
  if (greeting && !greeting.enabled) return null;
  const partyNote = invitee.kind === "guest" && (invitee.partySize ?? 1) > 1 ? " & guests" : "";
  return {
    name: `${invitee.displayName}${partyNote}`,
    message: greeting?.message?.trim() || DEFAULT_GREETING,
  };
}

/** Remove a deleted group/guest id from every audience in a config. */
export function stripFromAudiences(
  config: WeddingConfig,
  removed: { groupId?: string; guestId?: string }
): Pick<WeddingConfig, "privateSections" | "sectionAudiences"> {
  const strip = (a: Audience): Audience => ({
    groupIds: a.groupIds.filter((id) => id !== removed.groupId),
    guestIds: a.guestIds.filter((id) => id !== removed.guestId),
  });
  const sectionAudiences = Object.fromEntries(
    Object.entries(config.sectionAudiences ?? {}).map(([k, a]) => [k, strip(a as Audience)])
  ) as WeddingConfig["sectionAudiences"];
  return {
    privateSections: config.privateSections?.map((s) => ({ ...s, audience: strip(s.audience) })),
    sectionAudiences,
  };
}

// ─── Name lookup (fuzzy) ─────────────────────────────────────────────────────

export function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents: "José" → "jose"
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

function nameScore(query: string, candidate: string): number {
  if (query === candidate) return 1;
  const q = query.split(" ");
  const c = candidate.split(" ");
  // "maria santos" should find "Maria Clara Santos".
  if (q.length >= 2 && q.every((t) => c.includes(t))) return 0.92;
  return 1 - levenshtein(query, candidate) / Math.max(query.length, candidate.length);
}

const MATCH_THRESHOLD = 0.8;
const AMBIGUITY_MARGIN = 0.08;

export type NameMatch =
  | { status: "match"; guest: GuestListEntry }
  | { status: "needs-code" }
  | { status: "none" };

/**
 * Tolerates typos, accents, and middle names. When two guests are equally
 * plausible (e.g. two "Maria Santos"), returns `needs-code` rather than guess,
 * and never reveals which names exist.
 */
export function matchGuestByName(query: string, guests: GuestListEntry[]): NameMatch {
  const q = normalizeName(query);
  if (q.length < 3) return { status: "none" };
  const scored = guests
    .map((guest) => ({ guest, score: nameScore(q, normalizeName(guest.name)) }))
    .filter((x) => x.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
  if (scored.length === 0) return { status: "none" };
  const [best, next] = scored;
  if (next && best.score - next.score < AMBIGUITY_MARGIN) return { status: "needs-code" };
  return { status: "match", guest: best.guest };
}

export type FindResult = { status: "found"; code: string } | { status: "needs-code" } | { status: "none" };

/**
 * "Find your invitation": in the `lookup` step the input is a name or a code
 * (anything that normalizes to 8 characters is tried as a code first); in the
 * `code` step only a code is accepted.
 */
export function findInvitation(
  input: string,
  step: "lookup" | "code",
  guests: GuestListEntry[],
  groups: GuestGroup[]
): FindResult {
  const tryCode = () => {
    const invitee = findInviteeByCode(input, guests, groups);
    return invitee ? ({ status: "found", code: invitee.code } as const) : null;
  };
  if (step === "code") return tryCode() ?? { status: "none" };
  const byCode = normalizeCode(input).length === 8 ? tryCode() : null;
  if (byCode) return byCode;
  const match = matchGuestByName(input, guests);
  return match.status === "match" ? { status: "found", code: match.guest.inviteCode } : match;
}

// ─── Open invitation (name typed in the RSVP form) ──────────────────────────

/**
 * A guest identified from the RSVP form on the open invitation. Carries only
 * what the form needs (never the invite code or other guests), so it doesn't
 * unlock private content the way an invite link does.
 */
export type OpenInviteMatch =
  | { status: "match"; guestId: string; allowance: number }
  | { status: "needs-code" }
  | { status: "none" };

/**
 * Looks up the guest typed into the RSVP form. Async so it can be backed by the
 * server (`public.match_open_invite` in db/migrations/0008) without changing callers.
 */
export interface GuestMatcher {
  byName(name: string): Promise<OpenInviteMatch>;
  byCode(code: string): Promise<OpenInviteMatch>;
}

export function isOpenInviteMatchingOn(config: Pick<WeddingConfig, "tier" | "openInviteMatching">): boolean {
  return isPersonalized(config) && config.openInviteMatching !== false;
}

/** Matcher over a guest list already on the client. Only guest codes count: a group code names nobody. */
export function localGuestMatcher(guests: GuestListEntry[]): GuestMatcher {
  const found = (g: GuestListEntry): OpenInviteMatch => ({
    status: "match",
    guestId: g.id,
    allowance: guestAllowance(g.partySize),
  });
  return {
    byName: async (name) => {
      const match = matchGuestByName(name, guests);
      return match.status === "match" ? found(match.guest) : match;
    },
    byCode: async (input) => {
      const code = normalizeCode(input);
      const guest = code ? guests.find((g) => g.inviteCode === code) : undefined;
      return guest ? found(guest) : { status: "none" };
    },
  };
}
