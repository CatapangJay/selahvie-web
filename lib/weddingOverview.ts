import type { GuestListEntry, RSVPEntry, WeddingConfig } from "@/types/wedding";
import type { WeddingTemplate } from "@/types/template";

/** "Ana & Miguel", or the template's name until both names are filled in. */
export function coupleLabelOf(config: WeddingConfig, template?: WeddingTemplate): string {
  return config.partner1Name && config.partner2Name
    ? `${config.partner1Name} & ${config.partner2Name}`
    : template?.name ?? "Your wedding";
}

/** Whole days from today (local) to the ISO date; negative once it has passed, null if unset/invalid. */
export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const day = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(day.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((day.getTime() - today.getTime()) / 86_400_000);
}

/** "214 days to go", "Tomorrow", "Today", "Married 3 days ago"… */
export function countdownLabel(iso?: string): string {
  const d = daysUntil(iso);
  if (d === null) return "";
  if (d === 0) return "Today's the day";
  if (d === 1) return "Tomorrow";
  if (d > 1) return `${d.toLocaleString("en-US")} days to go`;
  if (d === -1) return "Married yesterday";
  return `Married ${Math.abs(d).toLocaleString("en-US")} days ago`;
}

/** "October 31, 2026" read as a local date. */
export function longDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export interface GuestTally {
  invitations: number;
  /** People, with party sizes counted. */
  people: number;
  attending: number;
  declined: number;
  waiting: number;
}

export function guestTally(guests: GuestListEntry[]): GuestTally {
  const heads = (pred: (g: GuestListEntry) => boolean) => guests.filter(pred).reduce((n, g) => n + (g.partySize || 1), 0);
  const people = heads(() => true);
  const attending = heads((g) => g.status === "attending");
  const declined = heads((g) => g.status === "declined");
  return { invitations: guests.length, people, attending, declined, waiting: people - attending - declined };
}

/**
 * The website to put first: the soonest upcoming wedding, then ones without a
 * date yet, then past weddings (most recent first).
 */
export function featuredFirst(configs: WeddingConfig[]): WeddingConfig[] {
  const rank = (c: WeddingConfig) => {
    const d = daysUntil(c.weddingDate);
    return d === null ? [1, 0] : d >= 0 ? [0, d] : [2, -d];
  };
  return [...configs].sort((a, b) => {
    const [ra, va] = rank(a);
    const [rb, vb] = rank(b);
    return ra - rb || va - vb;
  });
}

/** "just now", "5 min ago", "3 h ago", "yesterday", "Mar 4". */
export function timeAgo(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const mins = Math.round((now - t) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return "yesterday";
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** People a reply brings (the guest plus any extras); 0 when declining. */
export function replyHeads(r: RSVPEntry): number {
  return r.attending ? 1 + (r.additionalGuests ?? (r.plusOne ? 1 : 0)) : 0;
}
