"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRightLeft, CircleCheck, Clock, Crosshair, Mail, Phone, StickyNote, UserMinus, X } from "lucide-react";
import { needsSeat, seatsFor, seatsTaken } from "@/lib/seating";
import type { GuestListEntry, GuestSide, SeatingTable } from "@/types/wedding";
import { Avatar } from "./FloorSurface";
import { plural } from "./shared";

const MUTED = { color: "var(--color-on-surface-variant)" } as const;

function seatLine(g: GuestListEntry) {
  const n = seatsFor(g);
  if (g.status === "attending") return { icon: CircleCheck, text: `${plural(n, "seat")} confirmed`, color: "var(--color-success)" };
  if (g.status === "declined") return { icon: X, text: "Declined", color: "var(--color-error)" };
  return { icon: Clock, text: `No reply yet · ${plural(n, "seat")}`, color: "var(--color-on-surface-variant)" };
}

function GuestLine({ guest, side, onClick }: { guest: GuestListEntry; side: GuestSide | undefined; onClick: () => void }) {
  const line = seatLine(guest);
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-surface-container-low)]"
        style={{ borderRadius: "var(--radius-sm)" }}
      >
        <Avatar name={guest.name} side={side} size={28} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm" style={{ color: "var(--color-on-surface)" }}>{guest.name}</span>
          <span className="flex items-center gap-1 text-xs" style={{ color: line.color }}>
            <line.icon size={12} aria-hidden />
            {line.text}
          </span>
        </span>
      </button>
    </li>
  );
}

function CardHeader({ title, sub, onBack, onClose }: { title: ReactNode; sub?: ReactNode; onBack?: () => void; onClose?: () => void }) {
  return (
    <div className="flex items-start gap-1.5 px-3 pb-2 pt-3" style={{ borderBottom: "1px solid var(--color-outline)" }}>
      {onBack && (
        <IconButton label="Back to table" onClick={onBack}>
          <ArrowLeft size={15} />
        </IconButton>
      )}
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>{title}</p>
        {sub && <p className="text-xs" style={MUTED}>{sub}</p>}
      </div>
      {onClose && (
        <IconButton label="Close" onClick={onClose}>
          <X size={15} />
        </IconButton>
      )}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center transition-colors hover:bg-[var(--color-surface-container-high)]"
      style={{ borderRadius: "var(--radius-full)", color: "var(--color-on-surface-variant)" }}
    >
      {children}
    </button>
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────

/** Who's at a table. Click someone to see their details. */
export function TableCard({ table, seated, sideOf, onGuest, onClose }: {
  table: SeatingTable;
  seated: GuestListEntry[];
  sideOf: (g: GuestListEntry) => GuestSide | undefined;
  onGuest: (id: string) => void;
  onClose: () => void;
}) {
  const list = seated.filter(needsSeat);
  const taken = seatsTaken(seated);
  return (
    <>
      <CardHeader
        title={table.name || "Untitled"}
        sub={
          <>
            {table.tag ? `${table.tag} · ` : ""}
            <span style={{ color: taken > table.seats ? "var(--color-error)" : undefined }}>{taken} of {table.seats} seats taken</span>
          </>
        }
        onClose={onClose}
      />
      {list.length === 0 ? (
        <p className="px-3 py-3 text-xs" style={MUTED}>No one seated yet. Drag a guest here, or pick one in the table details below.</p>
      ) : (
        <ul className="max-h-72 overflow-y-auto p-1.5">
          {list.map((g) => <GuestLine key={g.id} guest={g} side={sideOf(g)} onClick={() => onGuest(g.id)} />)}
        </ul>
      )}
    </>
  );
}

// ─── Guest ───────────────────────────────────────────────────────────────────

interface GuestDetailsProps {
  guest: GuestListEntry;
  table: SeatingTable | undefined;
  tables: SeatingTable[];
  byTable: Map<string, GuestListEntry[]>;
  sideOf: (g: GuestListEntry) => GuestSide | undefined;
  sideName: (side: GuestSide | undefined) => string;
  onGuest: (id: string) => void;
  onSeat: (tableId: string | null) => void;
  /** Start "click a table" placement on the floor plan. */
  onPlace: () => void;
  onBack?: () => void;
  onClose: () => void;
}

/** A guest's seat at a glance: where they sit, who with, and how to move them. */
export function GuestDetails({ guest, table, tables, byTable, sideOf, sideName, onGuest, onSeat, onPlace, onBack, onClose }: GuestDetailsProps) {
  const [moving, setMoving] = useState(false);
  const line = seatLine(guest);
  const side = sideOf(guest);
  const mates = table ? (byTable.get(table.id) ?? []).filter((g) => g.id !== guest.id && needsSeat(g)) : [];
  const targets = tables.filter((t) => t.id !== table?.id);
  const free = (t: SeatingTable) => t.seats - seatsTaken(byTable.get(t.id) ?? []);

  return (
    <div className="w-[19rem]">
      <CardHeader
        title={table ? `${table.name || "Untitled"}${table.tag ? ` · ${table.tag}` : ""}` : "Not seated"}
        sub={table ? "Seat assignment" : "Waiting for a table"}
        onBack={onBack}
        onClose={onClose}
      />

      <div className="space-y-3 p-3">
        <div className="flex items-center gap-3 p-2.5" style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-md)" }}>
          <Avatar name={guest.name} side={side} size={40} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.9375rem] font-medium" style={{ color: "var(--color-on-surface)" }}>{guest.name}</p>
            <p className="flex items-center gap-1 text-xs" style={{ color: line.color }}>
              <line.icon size={12} aria-hidden /> {line.text}
            </p>
            <p className="text-xs" style={MUTED}>{side ? `${sideName(side)}'s side` : "Side not set"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {table ? (
            <ActionButton icon={UserMinus} label="Remove" tone="danger" onClick={() => onSeat(null)} />
          ) : (
            <ActionButton icon={Crosshair} label="Place on plan" tone="primary" onClick={onPlace} />
          )}
          {targets.length > 0 && (
            <ActionButton
              icon={ArrowRightLeft}
              label={table ? "Move to…" : "Seat at…"}
              pressed={moving}
              onClick={() => setMoving((m) => !m)}
            />
          )}
        </div>

        {moving && (
          <ul
            aria-label={table ? "Move to table" : "Seat at table"}
            className="max-h-48 overflow-y-auto p-1"
            style={{ border: "1px solid var(--color-outline)", borderRadius: "var(--radius-sm)" }}
          >
            {targets.map((t) => {
              const room = free(t);
              const fits = room >= seatsFor(guest);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSeat(t.id);
                      setMoving(false);
                    }}
                    className="flex min-h-[36px] w-full items-center justify-between gap-3 px-2 text-left text-sm transition-colors hover:bg-[var(--color-surface-container-low)]"
                    style={{ borderRadius: "calc(var(--radius-sm) - 2px)", color: "var(--color-on-surface)" }}
                  >
                    <span className="min-w-0 truncate">
                      {t.name || "Untitled"}
                      {t.tag && <span style={MUTED}> · {t.tag}</span>}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums" style={{ color: fits ? "var(--color-on-surface-variant)" : "var(--color-error)" }}>
                      {room > 0 ? `${room} free` : "Full"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {table && (
          <div>
            <p className="mb-1 px-0.5 text-xs font-medium" style={MUTED}>
              {mates.length ? `Also at ${table.name || "this table"} (${mates.length})` : "No one else at this table yet"}
            </p>
            {mates.length > 0 && (
              <ul className="-mx-1 max-h-52 overflow-y-auto">
                {mates.map((g) => <GuestLine key={g.id} guest={g} side={sideOf(g)} onClick={() => onGuest(g.id)} />)}
              </ul>
            )}
          </div>
        )}

        {(guest.note || guest.email || guest.phone) && (
          <dl className="space-y-1 pt-2 text-xs" style={{ ...MUTED, borderTop: "1px solid var(--color-outline)" }}>
            {guest.note && <Info icon={StickyNote} label="Note">{guest.note}</Info>}
            {guest.email && <Info icon={Mail} label="Email">{guest.email}</Info>}
            {guest.phone && <Info icon={Phone} label="Mobile">{guest.phone}</Info>}
          </dl>
        )}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="pt-0.5"><Icon size={12} aria-label={label} /></dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function ActionButton({ icon: Icon, label, tone, pressed, onClick }: {
  icon: typeof Mail;
  label: string;
  tone?: "primary" | "danger";
  pressed?: boolean;
  onClick: () => void;
}) {
  const color = tone === "danger" ? "var(--color-error)" : tone === "primary" ? "var(--color-primary-dim)" : "var(--color-on-surface)";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={pressed}
      className="inline-flex min-h-[34px] items-center gap-1.5 px-3 text-sm transition-colors hover:bg-[var(--color-surface-container-low)]"
      style={{
        color,
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${pressed ? "var(--color-on-surface-variant)" : "var(--color-outline)"}`,
        background: pressed ? "var(--color-surface-container-low)" : "var(--color-surface-container-lowest)",
      }}
    >
      <Icon size={14} aria-hidden />
      {label}
    </button>
  );
}
