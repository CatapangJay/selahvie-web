"use client";

import Select, { type SelectOption } from "@/components/ui/Select";
import type { GuestGroup, GuestListEntry } from "@/types/wedding";

interface Props {
  guests: GuestListEntry[];
  groups: GuestGroup[];
  /** Current invite code, or "" for a public visitor. */
  value: string;
  onChange: (code: string) => void;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Select for previewing the site as the public, a group, or a single guest. */
export default function ViewAsSelect({ guests, groups, value, onChange, id, className, style }: Props) {
  const options: SelectOption[] = [
    { value: "", label: "Public visitor (no invite)" },
    ...groups.map((g) => ({ value: g.inviteCode, label: g.name, group: "Groups" })),
    ...[...guests]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((g) => ({ value: g.inviteCode, label: g.name, group: "Guests" })),
  ];
  return (
    <Select
      id={id}
      aria-label="View as"
      variant="chip"
      value={value}
      onChange={onChange}
      options={options}
      className={className}
      style={style}
    />
  );
}
