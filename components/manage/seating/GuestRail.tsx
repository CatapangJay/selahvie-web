"use client";

import { useId, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { tableShortLabel } from "@/lib/seating";
import type { GuestListEntry, GuestSide, SeatingTable } from "@/types/wedding";
import { Avatar } from "./FloorSurface";
import { GUEST_MIME, isGuestDrag, statusLabel } from "./shared";

type SeatFilter = "unseated" | "seated" | "all";
type ReplyFilter = "any" | "going" | "waiting";

interface Props {
  /** Everyone who needs a seat (declined guests excluded). */
  guests: GuestListEntry[];
  tableOf: (g: GuestListEntry) => SeatingTable | undefined;
  sideOf: (g: GuestListEntry) => GuestSide | undefined;
  pickedId: string | null;
  onPick: (id: string) => void;
  /** A guest dropped on the panel goes back to unseated. */
  onUnseat: (id: string) => void;
}

const isWaiting = (g: GuestListEntry) => g.status === "invited" || g.status === "pending";

export default function GuestRail({ guests, tableOf, sideOf, pickedId, onPick, onUnseat }: Props) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [seatFilter, setSeatFilter] = useState<SeatFilter>("unseated");
  const [reply, setReply] = useState<ReplyFilter>("any");
  const [over, setOver] = useState(false);

  const q = query.trim().toLowerCase();
  const byReply = guests.filter((g) => reply === "any" || (reply === "going" ? g.status === "attending" : isWaiting(g)));
  const counts = {
    unseated: byReply.filter((g) => !tableOf(g)).length,
    seated: byReply.filter((g) => tableOf(g)).length,
    all: byReply.length,
  };
  const shown = byReply
    .filter((g) => (seatFilter === "all" ? true : seatFilter === "seated" ? Boolean(tableOf(g)) : !tableOf(g)))
    .filter((g) => !q || g.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));

  const everyoneSeated = guests.length > 0 && guests.every((g) => tableOf(g));

  return (
    <section
      aria-labelledby={`${searchId}-heading`}
      className="flex min-h-0 flex-col transition-colors lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start"
      onDragOver={(e) => {
        if (!isGuestDrag(e)) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        setOver(false);
        const id = e.dataTransfer.getData(GUEST_MIME);
        if (id) onUnseat(id);
      }}
      style={{
        background: over ? "var(--color-primary-container)" : "var(--color-surface-container-lowest)",
        borderRadius: "var(--radius-md)",
        border: `1px ${over ? "dashed var(--color-primary)" : "solid var(--color-outline)"}`,
      }}
    >
      <div className="space-y-3 p-3" style={{ borderBottom: "1px solid var(--color-outline)" }}>
        <h3 id={`${searchId}-heading`} className="sr-only">Guests</h3>
        <label htmlFor={searchId} className="sr-only">Find a guest</label>
        <div className="relative flex items-center">
          <Search size={14} aria-hidden className="pointer-events-none absolute left-3" style={{ color: "var(--color-on-surface-variant)" }} />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Find a guest"
            autoComplete="off"
            className="h-10 w-full bg-[var(--color-surface-container-low)] pl-8 pr-8 text-sm outline-none placeholder:text-[var(--color-on-surface-variant)]"
            style={{ color: "var(--color-on-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-outline)" }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear guest search"
              className="absolute right-2 inline-flex h-6 w-6 items-center justify-center hover:bg-[var(--color-surface-container-high)]"
              style={{ borderRadius: "var(--radius-full)", color: "var(--color-on-surface-variant)" }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <Segmented<SeatFilter>
          label="Show guests"
          value={seatFilter}
          onChange={setSeatFilter}
          options={[
            ["unseated", "Unseated", counts.unseated],
            ["seated", "Seated", counts.seated],
            ["all", "All", counts.all],
          ]}
        />
        <Segmented<ReplyFilter>
          label="RSVP"
          quiet
          value={reply}
          onChange={setReply}
          options={[
            ["any", "Any reply"],
            ["going", "Going"],
            ["waiting", "No reply yet"],
          ]}
        />
      </div>

      <ul className="min-h-28 flex-1 overflow-y-auto p-1.5" aria-label={`${seatFilter === "all" ? "All" : seatFilter === "seated" ? "Seated" : "Unseated"} guests`}>
        {shown.length === 0 ? (
          <li className="flex flex-col items-start gap-1 px-2.5 py-4 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
            {seatFilter === "unseated" && everyoneSeated && !q ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--color-success)" }}>
                  <Check size={14} aria-hidden /> Everyone has a seat
                </span>
                Drag a guest here to unseat them.
              </>
            ) : q ? (
              `No guests match “${query.trim()}”.`
            ) : seatFilter === "seated" ? (
              "No one seated yet. Drag a guest onto a table."
            ) : (
              "No guests match these filters."
            )}
          </li>
        ) : (
          shown.map((g) => {
            const active = g.id === pickedId;
            const table = tableOf(g);
            return (
              <li key={g.id}>
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(GUEST_MIME, g.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => onPick(g.id)}
                  aria-pressed={active}
                  aria-label={`${g.name}${g.partySize > 1 ? `, party of ${g.partySize}` : ""}${table ? `, at ${table.name}` : ", not seated"}`}
                  className="flex min-h-[44px] w-full cursor-grab items-center gap-2.5 px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-container-low)] active:cursor-grabbing"
                  style={{
                    borderRadius: "var(--radius-sm)",
                    background: active ? "var(--color-primary-container-strong)" : undefined,
                    boxShadow: active ? "inset 0 0 0 1px var(--color-primary)" : undefined,
                    color: "var(--color-on-surface)",
                  }}
                >
                  <Avatar name={g.name} side={sideOf(g)} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{g.name}</span>
                    {(g.status !== "attending" || g.partySize > 1) && (
                      <span className="block truncate text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                        {[g.status !== "attending" && statusLabel(g.status), g.partySize > 1 && `${g.partySize} seats`].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                  {table && (
                    <span
                      className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center px-1.5 text-xs font-medium tabular-nums"
                      title={table.name}
                      style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)", borderRadius: "var(--radius-sm)" }}
                    >
                      {tableShortLabel(table)}
                    </span>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}

function Segmented<T extends string>({
  label, value, onChange, options, quiet,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string, number?][];
  quiet?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid gap-0.5 p-0.5"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        background: quiet ? "transparent" : "var(--color-surface-container)",
        borderRadius: "var(--radius-sm)",
        border: quiet ? "1px solid var(--color-outline)" : "none",
      }}
    >
      {options.map(([id, text, count]) => {
        const on = value === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(id)}
            className="inline-flex min-h-[32px] items-center justify-center gap-1.5 truncate px-1.5 text-xs transition-colors hover:text-[var(--color-on-surface)]"
            style={{
              borderRadius: "calc(var(--radius-sm) - 2px)",
              background: on ? (quiet ? "var(--color-primary-container-strong)" : "var(--color-surface-container-lowest)") : "transparent",
              color: on ? (quiet ? "var(--color-primary-dim)" : "var(--color-on-surface)") : "var(--color-on-surface-variant)",
              fontWeight: on ? 500 : 400,
              boxShadow: on && !quiet ? "0 1px 2px rgb(47 30 38 / 0.08)" : "none",
            }}
          >
            {text}
            {count !== undefined && <span className="tabular-nums" style={{ opacity: 0.85 }}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
