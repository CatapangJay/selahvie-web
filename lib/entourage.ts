import type { WeddingPartyMember } from "@/types/wedding";

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
  const named = members.filter((m) => m.name.trim());
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
