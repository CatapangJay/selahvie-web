"use client";

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
  const sortedGuests = [...guests].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={className} style={style}>
      <option value="">Public visitor (no invite)</option>
      {groups.length > 0 && (
        <optgroup label="Groups">
          {groups.map((g) => (
            <option key={g.id} value={g.inviteCode}>{g.name}</option>
          ))}
        </optgroup>
      )}
      {sortedGuests.length > 0 && (
        <optgroup label="Guests">
          {sortedGuests.map((g) => (
            <option key={g.id} value={g.inviteCode}>{g.name}</option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
