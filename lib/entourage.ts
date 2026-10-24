import type { EntourageColumns, EntourageLayout, ParentNameStyle, WeddingPartyMember } from "@/types/wedding";

/** One preset role. `plural` is used for headings on the website. */
export interface EntourageRole {
  role: string;
  plural: string;
}

export interface EntourageCategory {
  id: string;
  label: string;
  roles: EntourageRole[];
}

/** Preset roles in ceremony order. Members with any other role fall under "Others". */
export const ENTOURAGE: EntourageCategory[] = [
  {
    id: "parents",
    label: "Parents",
    roles: [
      { role: "Parent", plural: "Parents" },
      { role: "Grandparent", plural: "Grandparents" },
    ],
  },
  {
    id: "principal",
    label: "Principal sponsors",
    roles: [
      { role: "Godfather", plural: "Godfathers" },
      { role: "Godmother", plural: "Godmothers" },
    ],
  },
  {
    id: "honor",
    label: "Honor attendants",
    roles: [
      { role: "Best Man", plural: "Best Men" },
      { role: "Maid of Honor", plural: "Maids of Honor" },
      { role: "Matron of Honor", plural: "Matrons of Honor" },
      { role: "Patron of Honor", plural: "Patrons of Honor" },
      { role: "Man of Honor", plural: "Men of Honor" },
    ],
  },
  {
    id: "secondary",
    label: "Secondary sponsors",
    roles: [
      { role: "Candle Sponsor", plural: "Candle Sponsors" },
      { role: "Veil Sponsor", plural: "Veil Sponsors" },
      { role: "Cord Sponsor", plural: "Cord Sponsors" },
    ],
  },
  {
    id: "attendants",
    label: "Groomsmen & bridesmaids",
    roles: [
      { role: "Groomsman", plural: "Groomsmen" },
      { role: "Bridesmaid", plural: "Bridesmaids" },
      { role: "Usher", plural: "Ushers" },
    ],
  },
  {
    id: "bearers",
    label: "Bearers & flower girls",
    roles: [
      { role: "Ring Bearer", plural: "Ring Bearers" },
      { role: "Coin Bearer", plural: "Coin Bearers" },
      { role: "Bible Bearer", plural: "Bible Bearers" },
      { role: "Flower Girl", plural: "Flower Girls" },
    ],
  },
];

export const OTHER_CATEGORY = { id: "other", label: "Others" } as const;

const norm = (s: string) => s.trim().toLowerCase();

/** The category a role belongs to ("other" for custom roles). */
export function categoryOf(role: string): string {
  const r = norm(role);
  return ENTOURAGE.find((c) => c.roles.some((x) => norm(x.role) === r))?.id ?? OTHER_CATEGORY.id;
}

export function isPresetRole(role: string): boolean {
  return categoryOf(role) !== OTHER_CATEGORY.id;
}

/** Roles listed as a pair of names (both parents on one row). */
export function isPairedRole(role: string): boolean {
  return categoryOf(role) === "parents";
}

// A second name left over from before the role changed doesn't count.
const secondName = (m: WeddingPartyMember) => (isPairedRole(m.role) ? (m.name2?.trim() ?? "") : "");

export const isNamed = (m: WeddingPartyMember) => Boolean(m.name.trim() || secondName(m));

// A title already typed before the first name, so "titled" doesn't double it.
const LEADING_TITLE = /^(mr\.?\s*(&|and)\s*mrs|mr|mrs|ms)\.?\s+/i;

/** A member's name as shown on the site; pairs follow the wedding's parent-name style. */
export function displayName(m: WeddingPartyMember, style: ParentNameStyle = "titled"): string {
  const first = m.name.trim();
  const second = secondName(m);
  if (!first || !second) return first || second;
  return style === "full" ? `${first} & ${second}` : `Mr. & Mrs. ${first.replace(LEADING_TITLE, "")}`;
}

// Three columns drop to two on phones, where names would wrap word by word.
// An odd last item in two columns spans the row so it sits centred.
const COLUMN_CLASS: Record<EntourageColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2 [&>:last-child:nth-child(odd)]:col-span-2",
  3: "grid-cols-2 sm:grid-cols-3 max-sm:[&>:last-child:nth-child(odd)]:col-span-2",
};

export interface ColumnLayout {
  /** Columns in use, capped at what there is to split. */
  columns: EntourageColumns;
  /** Grid-column classes for the category's roles. */
  roles: string;
  /** Grid-column classes for a lone role's names; undefined = one name per line. */
  names?: string;
}

/**
 * The couple's chosen columns for a category, or undefined to keep the
 * template's own layout. Several roles sit side by side; a lone role spreads
 * its names across the columns.
 */
export function columnLayout(layout: EntourageLayout | undefined, categoryId: string, roles: RoleGroup[]): ColumnLayout | undefined {
  const chosen = layout?.columns?.[categoryId];
  if (!chosen) return undefined;
  if (roles.length > 1) {
    const n = Math.min(chosen, roles.length) as EntourageColumns;
    return { columns: n, roles: COLUMN_CLASS[n] };
  }
  const n = Math.min(chosen, Math.max(1, roles[0]?.members.length ?? 1)) as EntourageColumns;
  return { columns: n, roles: COLUMN_CLASS[1], names: n > 1 ? COLUMN_CLASS[n] : undefined };
}

const ROLE_ORDER = ENTOURAGE.flatMap((c) => c.roles.map((r) => norm(r.role)));

/** Heading for a group of members who share a role. */
export function rolePlural(role: string, count: number): string {
  if (count === 1) return role;
  const r = norm(role);
  return ENTOURAGE.flatMap((c) => c.roles).find((x) => norm(x.role) === r)?.plural ?? role;
}

export interface RoleGroup {
  role: string;
  heading: string;
  members: WeddingPartyMember[];
}

export interface CategoryGroup {
  id: string;
  label: string;
  roles: RoleGroup[];
}

/**
 * Named members grouped by category, then role, in ceremony order. Custom roles
 * follow the presets in the order they were first added.
 */
export function groupEntourage(members: WeddingPartyMember[]): CategoryGroup[] {
  const named = members.filter(isNamed);
  const cats = [...ENTOURAGE.map((c) => ({ id: c.id, label: c.label })), OTHER_CATEGORY];
  return cats
    .map((cat) => {
      const inCat = named.filter((m) => categoryOf(m.role) === cat.id);
      const roleKeys = [...new Set(inCat.map((m) => norm(m.role)))].sort((a, b) => {
        const ia = ROLE_ORDER.indexOf(a);
        const ib = ROLE_ORDER.indexOf(b);
        return (ia < 0 ? Infinity : ia) - (ib < 0 ? Infinity : ib);
      });
      const roles = roleKeys.map((key) => {
        const list = inCat.filter((m) => norm(m.role) === key);
        const role = list[0].role.trim();
        return { role, heading: role ? rolePlural(role, list.length) : "", members: list };
      });
      return { id: cat.id, label: cat.label, roles };
    })
    .filter((c) => c.roles.length > 0);
}
