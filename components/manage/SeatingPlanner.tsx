"use client";

import { useEffect, useId, useMemo, useRef, useState, type DragEvent, type KeyboardEvent, type PointerEvent } from "react";
import { useWeddingStore } from "@/store/weddingStore";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import EmptyState from "@/components/ui/EmptyState";
import Select, { type SelectOption } from "@/components/ui/Select";
import { PERSONALIZED_ADDON_CENTS } from "@/lib/tiers";
import { downloadFile, formatPrice, toCsv } from "@/lib/utils";
import {
  MAX_SEATS,
  MAX_TABLES,
  MIN_SEATS,
  addTable,
  assign,
  clampPos,
  clampSeats,
  fourSideCounts,
  fourSided,
  maxLongSeats,
  MAX_END_SEATS,
  guestsByTable,
  needsSeat,
  patchTable,
  planOf,
  removeTable,
  seatsFor,
  seatsTaken,
  setSide,
} from "@/lib/seating";
import { SIDE_COLOR, partnerNames, sideOptions as buildSideOptions } from "@/lib/guestSides";
import type { GuestListEntry, SeatingPlan, GuestSide, SeatingTable, WeddingConfig } from "@/types/wedding";
import { Check, Circle, Download, LayoutGrid, List, Lock, Minus, Plus, RectangleHorizontal, Search, Trash2, X } from "lucide-react";

interface Props {
  config: WeddingConfig;
  coupleLabel: string;
  onUpgrade: () => void;
  onOpenGuests: () => void;
}

const GUEST_MIME = "application/x-selahvie-guest";

/** Calm outline action for the toolbar (sentence case, not the uppercase CTA label). */
const TOOL_BUTTON =
  "btn-outline inline-flex min-h-[40px] items-center justify-center gap-2 px-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40";
const TOOL_STYLE = { borderRadius: "var(--radius-sm)", letterSpacing: "normal" } as const;

const newId = () => `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const isGuestDrag = (e: DragEvent) => e.dataTransfer.types.includes(GUEST_MIME);

export default function SeatingPlanner({ config, coupleLabel, onUpgrade, onOpenGuests }: Props) {
  const personalized = config.tier === "personalized";
  const updateConfig = useWeddingStore((s) => s.updateConfig);
  const updateGuest = useWeddingStore((s) => s.updateGuest);
  const allGuests = useWeddingStore((s) => s.guests);
  const guests = useMemo(() => allGuests.filter((g) => g.weddingId === config.id), [allGuests, config.id]);

  const plan = planOf(config);
  const save = (next: SeatingPlan) => updateConfig(config.id, { seatingPlan: next });

  // Sides live on the guest; older plans kept them in seatingPlan.sides.
  const sideOf = (g: GuestListEntry): GuestSide | undefined => g.side ?? plan.sides[g.id];
  const changeSide = (guestId: string, side: GuestSide | null) => {
    updateGuest(guestId, { side: side ?? undefined });
    if (guestId in plan.sides) save(setSide(plan, guestId, null));
  };

  const [view, setView] = useState<"plan" | "list">("plan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyAttending, setOnlyAttending] = useState(false);

  const { p1, p2 } = partnerNames(config);
  const sideName = (side: GuestSide | undefined) => (side === "partner1" ? p1 : side === "partner2" ? p2 : "Not set");

  const byTable = guestsByTable(plan, guests);
  const isSeated = (g: GuestListEntry) => byTable.has(plan.assignments[g.id] ?? "");
  const seatable = guests.filter(needsSeat);
  const unseated = seatable
    .filter((g) => !isSeated(g))
    .sort((a, b) => a.name.localeCompare(b.name));

  const heads = (list: GuestListEntry[]) => list.reduce((n, g) => n + seatsFor(g), 0);
  const totalHeads = heads(seatable);
  const seatedHeads = heads(seatable.filter(isSeated));
  const capacity = plan.tables.reduce((n, t) => n + t.seats, 0);
  const sideHeads = (side: GuestSide) => heads(seatable.filter((g) => sideOf(g) === side));
  const unseatedHeads = totalHeads - seatedHeads;
  const shortBy = Math.max(0, totalHeads - capacity);

  const picked = guests.find((g) => g.id === pickedId);
  const selected = plan.tables.find((t) => t.id === selectedId);

  // Escape cancels "tap a guest, then a table".
  useEffect(() => {
    if (!pickedId) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setPickedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pickedId]);

  const seatGuest = (guestId: string, tableId: string | null) => {
    save(assign(plan, guestId, tableId));
    setPickedId(null);
  };

  const add = (shape: SeatingTable["shape"]) => {
    const id = newId();
    save(addTable(plan, id, shape));
    setSelectedId(id);
  };

  const deleteTable = (id: string) => {
    save(removeTable(plan, id));
    if (selectedId === id) setSelectedId(null);
  };

  const exportCsv = () => {
    const rows: (string | number)[][] = [];
    for (const t of plan.tables) {
      for (const g of byTable.get(t.id) ?? []) rows.push([t.name, g.name, g.partySize, sideName(sideOf(g)), g.status]);
    }
    for (const g of unseated) rows.push(["Not seated", g.name, g.partySize, sideName(sideOf(g)), g.status]);
    const safe = coupleLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "wedding";
    downloadFile(`${safe}-seating.csv`, toCsv(["Table", "Guest", "Party size", "Side", "RSVP"], rows));
  };

  const sideOptions: SelectOption[] = buildSideOptions(config);
  const tableOptions: SelectOption[] = [
    { value: "", label: "Not seated" },
    ...plan.tables.map((t) => ({ value: t.id, label: t.name || "Untitled table" })),
  ];

  const editorProps = {
    plan,
    byTable,
    unseated,
    sideOptions,
    tableOptions,
    sideOf,
    onSide: changeSide,
    onSave: save,
    onSeat: seatGuest,
    onDelete: deleteTable,
  };

  if (personalized && guests.length === 0) {
    return (
      <EmptyState
        glyph="&"
        title="Add guests before seating them"
        body="The seating chart uses your guest list. Add guests or import a CSV, then come back to place them at tables."
        actionLabel="Go to guest list"
        onAction={onOpenGuests}
      />
    );
  }

  return (
    <div className="space-y-8">
      {!personalized && (
        <div
          className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          style={{ background: "var(--color-primary-container)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline)" }}
        >
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--color-primary)" }}>
              <Lock size={12} aria-hidden />
              Personalized Invitations add-on
            </p>
            <h2 className="headline-sm mt-2" style={{ fontSize: "1.35rem" }}>Plan your reception seating</h2>
            <p className="mt-2 max-w-md text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              Lay out tables on a floor plan, drag guests into seats, balance both sides of the family and export the
              chart for your venue.
            </p>
          </div>
          <div className="shrink-0">
            <ButtonPrimary size="lg" onClick={onUpgrade}>
              Unlock for {formatPrice(PERSONALIZED_ADDON_CENTS)}
            </ButtonPrimary>
            <p className="mt-2 text-center text-xs" style={{ color: "var(--color-on-surface-muted)" }}>
              One-time add-on for this website
            </p>
          </div>
        </div>
      )}

      <div inert={!personalized} className="space-y-6" style={{ opacity: personalized ? 1 : 0.5 }}>
        {/* Summary + toolbar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[0.9375rem]" style={{ color: "var(--color-on-surface-variant)" }}>
              <span className="text-xl font-medium tabular-nums" style={{ color: "var(--color-on-surface)" }}>
                {seatedHeads}
              </span>{" "}
              of {totalHeads} {totalHeads === 1 ? "guest" : "guests"} seated
              {plan.tables.length > 0 && (
                <>
                  <span aria-hidden className="mx-2" style={{ color: "var(--color-outline)" }}>·</span>
                  {plan.tables.length} {plan.tables.length === 1 ? "table" : "tables"}, {capacity} seats
                </>
              )}
              {shortBy > 0 && plan.tables.length > 0 && (
                <>
                  <span aria-hidden className="mx-2" style={{ color: "var(--color-outline)" }}>·</span>
                  <span style={{ color: "var(--color-error)" }}>{shortBy} more {shortBy === 1 ? "seat" : "seats"} needed</span>
                </>
              )}
            </p>
            <SeatingProgress
              total={totalHeads}
              p1={{ name: p1, count: heads(seatable.filter((g) => isSeated(g) && sideOf(g) === "partner1")) }}
              p2={{ name: p2, count: heads(seatable.filter((g) => isSeated(g) && sideOf(g) === "partner2")) }}
              seated={seatedHeads}
            />
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
              <SideKey color={SIDE_COLOR.partner1} label={`${p1}'s side`} count={sideHeads("partner1")} />
              <SideKey color={SIDE_COLOR.partner2} label={`${p2}'s side`} count={sideHeads("partner2")} />
              <SideKey color={SIDE_COLOR.none} label="Side not set" count={totalHeads - sideHeads("partner1") - sideHeads("partner2")} />
              {unseatedHeads > 0 && <SideKey hollow label="Not seated" count={unseatedHeads} />}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex p-1"
              role="group"
              aria-label="Seating view"
              style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-sm)" }}
            >
              {([["plan", "Floor plan", LayoutGrid], ["list", "List", List]] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  onClick={() => setView(id)}
                  className="inline-flex min-h-[32px] items-center gap-2 px-3 text-sm transition-colors hover:text-[var(--color-on-surface)]"
                  style={{
                    borderRadius: "calc(var(--radius-sm) - 1px)",
                    background: view === id ? "var(--color-surface-container-lowest)" : "transparent",
                    color: view === id ? "var(--color-on-surface)" : "var(--color-on-surface-variant)",
                    fontWeight: view === id ? 500 : 400,
                    boxShadow: view === id ? "0 1px 2px rgba(47, 30, 38, 0.08)" : "none",
                  }}
                >
                  <Icon size={14} aria-hidden />
                  {label}
                </button>
              ))}
            </div>
            <span aria-hidden className="mx-1 hidden h-6 w-px sm:block" style={{ background: "var(--color-outline)" }} />
            <button type="button" className={TOOL_BUTTON} style={TOOL_STYLE} onClick={() => add("round")} disabled={plan.tables.length >= MAX_TABLES}>
              <Circle size={14} aria-hidden /> Round table
            </button>
            <button type="button" className={TOOL_BUTTON} style={TOOL_STYLE} onClick={() => add("rect")} disabled={plan.tables.length >= MAX_TABLES}>
              <RectangleHorizontal size={14} aria-hidden /> Long table
            </button>
            <button
              type="button"
              className={TOOL_BUTTON}
              style={TOOL_STYLE}
              onClick={exportCsv}
              disabled={plan.tables.length === 0}
              aria-label="Export seating chart as CSV"
              title="Export CSV"
            >
              <Download size={14} aria-hidden /> <span className="sm:sr-only">Export CSV</span>
            </button>
          </div>
        </div>

        {view === "plan" ? (
          <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <GuestPool
              guests={unseated}
              allCount={unseated.length}
              query={query}
              onQuery={setQuery}
              onlyAttending={onlyAttending}
              onOnlyAttending={setOnlyAttending}
              pickedId={pickedId}
              onPick={(id) => setPickedId((cur) => (cur === id ? null : id))}
              onDropGuest={(id) => seatGuest(id, null)}
              sideOf={sideOf}
            />

            <div className="min-w-0 space-y-4">
              <FloorPlan
                plan={plan}
                sideOf={sideOf}
                byTable={byTable}
                selectedId={selectedId}
                picking={Boolean(picked)}
                onSelect={setSelectedId}
                onTableClick={(id) => (pickedId ? seatGuest(pickedId, id) : setSelectedId(id))}
                onMove={(id, x, y) => save(patchTable(plan, id, { x, y }))}
                onDropGuest={seatGuest}
                onAdd={add}
              />

              <p
                className="min-h-5 text-xs"
                role="status"
                style={{ color: picked ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)" }}
              >
                {picked ? (
                  <>
                    Pick a table for <span className="font-medium">{picked.name}</span>. Press Esc to cancel.
                  </>
                ) : plan.tables.length > 0 ? (
                  "Drag tables to match your venue. Drag a guest onto a table, or click a guest and then a table. Arrow keys nudge the focused table."
                ) : null}
              </p>

              {selected && (
                <TableEditor
                  key={selected.id}
                  table={selected}
                  {...editorProps}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {plan.tables.length === 0 && (
              <EmptyState
                title="No tables yet"
                body="Add a round or long table above, then seat guests from the list below. Switch to the floor plan any time to arrange the room."
              />
            )}
            {plan.tables.map((t) => (
              <TableEditor key={t.id} table={t} {...editorProps} />
            ))}
            <section aria-labelledby="unseated-heading" className="pt-4">
              <h3 id="unseated-heading" className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
                Not seated
                <CountBadge n={unseated.length} />
              </h3>
              {unseated.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                  Everyone who needs a seat has one.
                </p>
              ) : (
                <ul style={{ borderTop: "1px solid var(--color-outline)" }}>
                  {unseated.map((g) => (
                    <GuestRow
                      key={g.id}
                      guest={g}
                      side={sideOf(g)}
                      sideOptions={sideOptions}
                      onSide={(side) => changeSide(g.id, side)}
                      tableOptions={plan.tables.length ? tableOptions : undefined}
                      onTable={(tableId) => seatGuest(g.id, tableId)}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Summary ─────────────────────────────────────────────────────────────────

/** One bar: seated guests split by side; the rest of the track is still to seat. */
function SeatingProgress({ total, seated, p1, p2 }: {
  total: number;
  seated: number;
  p1: { name: string; count: number };
  p2: { name: string; count: number };
}) {
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  const unset = Math.max(0, seated - p1.count - p2.count);
  const parts: [number, string][] = [
    [p1.count, SIDE_COLOR.partner1],
    [p2.count, SIDE_COLOR.partner2],
    [unset, SIDE_COLOR.none],
  ];
  return (
    <div
      role="progressbar"
      aria-label="Guests seated"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={seated}
      aria-valuetext={`${seated} of ${total} seated`}
      className="flex h-2 w-full max-w-xl overflow-hidden"
      style={{ background: "var(--color-surface-container-high)", borderRadius: "var(--radius-full)" }}
    >
      {parts.map(([n, color], i) => (
        <span
          key={i}
          className="h-full transition-[width] duration-300 ease-out"
          style={{ width: `${pct(n)}%`, background: color }}
        />
      ))}
    </div>
  );
}

function SideKey({ color, label, count, hollow }: { color?: string; label: string; count: number; hollow?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="h-2.5 w-2.5 shrink-0"
        style={{
          borderRadius: "var(--radius-full)",
          background: hollow ? "transparent" : color,
          border: hollow ? "1.5px solid var(--color-on-surface-muted)" : "none",
        }}
      />
      {label}
      <span className="font-medium tabular-nums" style={{ color: "var(--color-on-surface)" }}>{count}</span>
    </span>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span
      className="inline-flex h-5 min-w-5 items-center justify-center px-1.5 text-xs font-medium tabular-nums"
      style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)", borderRadius: "var(--radius-full)" }}
    >
      {n}
    </span>
  );
}

// ─── Unseated guests ─────────────────────────────────────────────────────────

interface PoolProps {
  guests: GuestListEntry[];
  allCount: number;
  query: string;
  onQuery: (q: string) => void;
  onlyAttending: boolean;
  onOnlyAttending: (v: boolean) => void;
  pickedId: string | null;
  onPick: (id: string) => void;
  onDropGuest: (id: string) => void;
  sideOf: (g: GuestListEntry) => GuestSide | undefined;
}

function GuestPool({ guests, allCount, query, onQuery, onlyAttending, onOnlyAttending, pickedId, onPick, onDropGuest, sideOf }: PoolProps) {
  const searchId = useId();
  const [over, setOver] = useState(false);
  const q = query.trim().toLowerCase();
  const shown = guests.filter((g) => (!onlyAttending || g.status === "attending") && (!q || g.name.toLowerCase().includes(q)));

  return (
    <section
      aria-labelledby={`${searchId}-heading`}
      className="flex flex-col transition-colors lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start"
      onDragOver={(e) => {
        if (!isGuestDrag(e)) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        const id = e.dataTransfer.getData(GUEST_MIME);
        if (id) onDropGuest(id);
      }}
      style={{
        background: over ? "var(--color-primary-container)" : "var(--color-surface-container-low)",
        borderRadius: "var(--radius-md)",
        border: `1px ${over ? "dashed var(--color-primary)" : "solid var(--color-outline)"}`,
      }}
    >
      <div className="space-y-3 p-4" style={{ borderBottom: "1px solid var(--color-outline)" }}>
        <h3 id={`${searchId}-heading`} className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
          Not seated
          <CountBadge n={allCount} />
        </h3>
        <label htmlFor={searchId} className="sr-only">Search guests</label>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2" style={{ color: "var(--color-on-surface-muted)" }} aria-hidden />
          <InputField id={searchId} value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search guests" className="pl-6" />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
          <input type="checkbox" checked={onlyAttending} onChange={(e) => onOnlyAttending(e.target.checked)} className="accent-[var(--color-primary)]" />
          Attending only
        </label>
      </div>
      <ul className="min-h-24 flex-1 overflow-y-auto p-2">
        {shown.length === 0 ? (
          <li className="flex flex-col items-start gap-1 px-2 py-4 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
            {allCount === 0 ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--color-success)" }}>
                  <Check size={14} aria-hidden /> Everyone has a seat
                </span>
                Drag a guest here to unseat them.
              </>
            ) : (
              "No guests match."
            )}
          </li>
        ) : (
          shown.map((g) => {
            const active = g.id === pickedId;
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
                  className="flex min-h-[40px] w-full cursor-grab items-center gap-2.5 px-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-container-high)] active:cursor-grabbing"
                  style={{
                    borderRadius: "var(--radius-sm)",
                    background: active ? "var(--color-primary-container-strong)" : undefined,
                    color: "var(--color-on-surface)",
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0"
                    style={{ background: SIDE_COLOR[sideOf(g) ?? "none"], borderRadius: "var(--radius-full)" }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{g.name}</span>
                    {g.status !== "attending" && (
                      <span className="block text-xs" style={{ color: "var(--color-on-surface-muted)" }}>
                        {g.status[0].toUpperCase() + g.status.slice(1)}
                      </span>
                    )}
                  </span>
                  {g.partySize > 1 && (
                    <span
                      className="shrink-0 px-1.5 text-xs tabular-nums"
                      style={{ color: "var(--color-on-surface-variant)", background: "var(--color-surface-container-high)", borderRadius: "var(--radius-full)" }}
                      title={`Party of ${g.partySize}`}
                    >
                      ×{g.partySize}
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

// ─── Floor plan ──────────────────────────────────────────────────────────────

interface FloorPlanProps {
  plan: SeatingPlan;
  sideOf: (g: GuestListEntry) => GuestSide | undefined;
  byTable: Map<string, GuestListEntry[]>;
  selectedId: string | null;
  picking: boolean;
  onSelect: (id: string | null) => void;
  onTableClick: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDropGuest: (guestId: string, tableId: string) => void;
  onAdd: (shape: SeatingTable["shape"]) => void;
}

/** Table sizes are in container-width units so the plan scales as a whole. */
const tableSize = (t: SeatingTable) => {
  if (t.shape === "round") return { w: 7 + t.seats * 0.45, h: 7 + t.seats * 0.45 };
  if (t.seatSides === 1) return { w: 5 + t.seats * 2.4, h: 5 };
  if (t.seatSides === 4) {
    const { long, ends } = fourSideCounts(t);
    return { w: 5 + long * 2.6, h: Math.max(6, 1.5 + ends * 2.6) };
  }
  return { w: 5 + Math.ceil(t.seats / 2) * 2.6, h: 6 };
};

const SEAT = 1.7; // seat dot diameter, cqw
const SEAT_GAP = 1.5; // gap between table edge and seat centre, cqw

function seatPositions(t: SeatingTable): { left: string; top: string }[] {
  const { w, h } = tableSize(t);
  if (t.shape === "round") {
    const r = w / 2 + SEAT_GAP;
    return Array.from({ length: t.seats }, (_, i) => {
      const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
      return { left: `calc(50% + ${(Math.cos(a) * r).toFixed(2)}cqw)`, top: `calc(50% + ${(Math.sin(a) * r).toFixed(2)}cqw)` };
    });
  }
  const row = (count: number, top: string) =>
    Array.from({ length: count }, (_, i) => ({ left: `${((i + 0.5) / count) * 100}%`, top }));
  const column = (count: number, left: string) =>
    Array.from({ length: count }, (_, i) => ({ left, top: `${((i + 0.5) / count) * 100}%` }));

  if (t.seatSides === 1) return row(t.seats, `-${SEAT_GAP}cqw`);
  const bottomTop = `calc(${h}cqw + ${SEAT_GAP}cqw)`;
  if (t.seatSides === 4) {
    const { long, ends } = fourSideCounts(t);
    return [
      ...row(long, `-${SEAT_GAP}cqw`),
      ...column(ends, `calc(100% + ${SEAT_GAP}cqw)`),
      ...row(long, bottomTop).reverse(),
      ...column(ends, `-${SEAT_GAP}cqw`).reverse(),
    ];
  }
  const top = Math.ceil(t.seats / 2);
  return [...row(top, `-${SEAT_GAP}cqw`), ...row(t.seats - top, bottomTop).reverse()];
}

function FloorPlan({ plan, sideOf, byTable, selectedId, picking, onSelect, onTableClick, onMove, onDropGuest, onAdd }: FloorPlanProps) {
  const planRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; px: number; py: number; x0: number; y0: number; moved: boolean } | null>(null);
  const [draft, setDraft] = useState<{ id: string; x: number; y: number } | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, t: SeatingTable) => {
    if (picking || e.button !== 0) return;
    dragRef.current = { id: t.id, px: e.clientX, py: e.clientY, x0: t.x, y0: t.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    const rect = planRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    setDraft({ id: d.id, x: clampPos(d.x0 + (dx / rect.width) * 100), y: clampPos(d.y0 + (dy / rect.height) * 100) });
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    if (d?.moved && draft) onMove(draft.id, draft.x, draft.y);
    setDraft(null);
    // Keep `moved` until the click that follows this pointerup has been ignored.
    setTimeout(() => {
      if (dragRef.current === d) dragRef.current = null;
    }, 0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, t: SeatingTable) => {
    const step = e.shiftKey ? 5 : 1;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = delta[e.key];
    if (!move) return;
    e.preventDefault();
    onMove(t.id, clampPos(t.x + move[0]), clampPos(t.y + move[1]));
  };

  return (
    <div className="overflow-x-auto" style={{ borderRadius: "var(--radius-md)" }}>
      <div
        ref={planRef}
        className="relative w-full min-w-[640px] select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
        style={{
          aspectRatio: "16 / 10",
          containerType: "inline-size",
          background:
            "radial-gradient(circle, var(--color-outline) 1px, transparent 1.2px) 0 0 / 24px 24px, var(--color-surface-container-lowest)",
          border: "1px solid var(--color-outline)",
          borderRadius: "var(--radius-md)",
        }}
      >
        {plan.tables.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="headline-sm" style={{ fontWeight: 400 }}>Start with your first table</p>
            <p className="max-w-sm text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              Add tables, drag them to match your venue, then drag guests from the list onto them.
            </p>
            <div className="flex gap-2">
              <ButtonPrimary size="sm" onClick={() => onAdd("round")}>Add a round table</ButtonPrimary>
              <ButtonSecondary size="sm" onClick={() => onAdd("rect")}>Add a long table</ButtonSecondary>
            </div>
          </div>
        )}

        {plan.tables.map((t) => {
          const pos = draft?.id === t.id ? draft : t;
          const seated = byTable.get(t.id) ?? [];
          const taken = seatsTaken(seated);
          const over = taken > t.seats;
          const { w, h } = tableSize(t);
          const fills = seated
            .filter(needsSeat)
            .flatMap((g) => Array<string>(seatsFor(g)).fill(SIDE_COLOR[sideOf(g) ?? "none"]));
          const isSelected = selectedId === t.id;
          const isDrop = dropId === t.id;

          return (
            <div
              key={t.id}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${w}cqw`,
                height: `${h}cqw`,
                transform: "translate(-50%, -50%)",
                zIndex: draft?.id === t.id ? 2 : isSelected ? 1 : 0,
              }}
              onDragOver={(e) => {
                if (!isGuestDrag(e)) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDropId(t.id);
              }}
              onDragLeave={() => setDropId((cur) => (cur === t.id ? null : cur))}
              onDrop={(e) => {
                setDropId(null);
                const id = e.dataTransfer.getData(GUEST_MIME);
                if (id) onDropGuest(id, t.id);
              }}
            >
              {seatPositions(t).map((p, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{
                    ...p,
                    width: `${SEAT}cqw`,
                    height: `${SEAT}cqw`,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "var(--radius-full)",
                    background: fills[i] ?? "var(--color-surface-container-lowest)",
                    border: fills[i] ? "none" : "1.5px solid var(--color-outline)",
                  }}
                />
              ))}
              <button
                type="button"
                aria-label={`${t.name || "Untitled table"}, ${taken} of ${t.seats} seats taken${over ? ", over capacity" : ""}`}
                aria-pressed={isSelected}
                onPointerDown={(e) => onPointerDown(e, t)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  dragRef.current = null;
                  setDraft(null);
                }}
                onClick={() => {
                  if (dragRef.current?.moved) return;
                  onTableClick(t.id);
                }}
                onKeyDown={(e) => onKeyDown(e, t)}
                className="absolute inset-0 flex touch-none flex-col items-center justify-center px-1 text-center transition-[box-shadow,background-color]"
                style={{
                  cursor: picking ? "copy" : draft?.id === t.id ? "grabbing" : "grab",
                  borderRadius: t.shape === "round" ? "var(--radius-full)" : "var(--radius-sm)",
                  background: isDrop ? "var(--color-primary-container-strong)" : "var(--color-surface-container-high)",
                  border: `1.5px solid ${isSelected || isDrop ? "var(--color-primary)" : over ? "var(--color-error)" : "var(--color-outline)"}`,
                  boxShadow: isSelected ? "0 0 0 3px var(--color-primary-container-strong)" : picking ? "0 0 0 2px var(--color-primary-container)" : "none",
                }}
              >
                <span
                  className="block max-w-full truncate font-medium leading-tight"
                  style={{ fontSize: "max(10px, 1.15cqw)", color: "var(--color-on-surface)" }}
                >
                  {t.name || "Untitled"}
                </span>
                <span
                  className="block tabular-nums leading-tight"
                  style={{ fontSize: "max(9px, 1cqw)", color: over ? "var(--color-error)" : "var(--color-on-surface-muted)" }}
                >
                  {taken}/{t.seats}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Table details ───────────────────────────────────────────────────────────

interface EditorProps {
  table: SeatingTable;
  plan: SeatingPlan;
  byTable: Map<string, GuestListEntry[]>;
  unseated: GuestListEntry[];
  sideOptions: SelectOption[];
  tableOptions: SelectOption[];
  sideOf: (g: GuestListEntry) => GuestSide | undefined;
  onSide: (guestId: string, side: GuestSide | null) => void;
  onSave: (next: SeatingPlan) => void;
  onSeat: (guestId: string, tableId: string | null) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

function TableEditor({ table, plan, byTable, unseated, sideOptions, tableOptions, sideOf, onSide, onSave, onSeat, onDelete, onClose }: EditorProps) {
  const nameId = useId();
  const seated = byTable.get(table.id) ?? [];
  const taken = seatsTaken(seated);
  const over = taken > table.seats;
  const patch = (data: Partial<SeatingTable>) => onSave(patchTable(plan, table.id, data));
  const free = table.seats - taken;
  const addOptions: SelectOption[] = [
    { value: "", label: unseated.length ? "Seat a guest…" : "Everyone is seated" },
    ...unseated.map((g) => ({ value: g.id, label: g.partySize > 1 ? `${g.name} (${g.partySize})` : g.name })),
  ];

  return (
    <section
      aria-label={table.name || "Untitled table"}
      className="p-5 sm:p-6"
      style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="min-w-48 flex-1">
          <InputField
            id={nameId}
            label="Table name"
            value={table.name}
            maxLength={40}
            onChange={(e) => patch({ name: e.target.value })}
            onBlur={(e) => {
              if (!e.target.value.trim()) patch({ name: "Untitled table" });
            }}
          />
        </div>

        {table.shape === "rect" && table.seatSides === 4 ? (
          <FourSideSeats table={table} onChange={patch} />
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Seats</span>
            <Stepper
              value={table.seats}
              noun="seat"
              min={MIN_SEATS}
              max={MAX_SEATS}
              onChange={(n) => patch({ seats: clampSeats(n) })}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-[0.8125rem] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Shape</span>
          <div className="inline-flex gap-1" role="group" aria-label="Table shape">
            {([["round", "Round", Circle], ["rect", "Long", RectangleHorizontal]] as const).map(([shape, label, Icon]) => (
              <button
                key={shape}
                type="button"
                aria-pressed={table.shape === shape}
                onClick={() => patch({ shape })}
                className="inline-flex min-h-[36px] items-center gap-1.5 px-3 text-sm transition-colors"
                style={{
                  borderRadius: "var(--radius-full)",
                  border: `1px solid ${table.shape === shape ? "var(--color-primary)" : "var(--color-outline)"}`,
                  background: table.shape === shape ? "var(--color-primary-container)" : "transparent",
                  color: table.shape === shape ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)",
                }}
              >
                <Icon size={13} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        {table.shape === "rect" && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.8125rem] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Chairs on</span>
            <div className="inline-flex gap-1" role="group" aria-label="Chairs on">
              {([[1, "One side"], [2, "Two sides"], [4, "All sides"]] as const).map(([count, label]) => {
                const active = (table.seatSides ?? 2) === count;
                return (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      if (count === 4) {
                        const { long, ends } = fourSideCounts(table);
                        patch(fourSided(long, ends));
                      } else patch({ seatSides: count });
                    }}
                    className="inline-flex min-h-[36px] items-center px-3 text-sm transition-colors"
                    style={{
                      borderRadius: "var(--radius-full)",
                      border: `1px solid ${active ? "var(--color-primary)" : "var(--color-outline)"}`,
                      background: active ? "var(--color-primary-container)" : "transparent",
                      color: active ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDelete(table.id)}
            className="inline-flex min-h-[36px] items-center gap-1.5 px-3 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--color-error)" }}
          >
            <Trash2 size={14} aria-hidden /> Delete table
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close table details"
              className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-container-high)]"
              style={{ borderRadius: "var(--radius-full)", color: "var(--color-on-surface-variant)" }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: over ? "var(--color-error)" : "var(--color-on-surface-variant)" }}>
          {over
            ? `${taken - table.seats} over capacity: ${taken} guests for ${table.seats} seats`
            : `${taken} of ${table.seats} seats taken${free > 0 && taken > 0 ? `, ${free} free` : ""}`}
        </p>
        <Select
          variant="chip"
          value=""
          options={addOptions}
          onChange={(id) => id && onSeat(id, table.id)}
          aria-label={`Seat a guest at ${table.name || "this table"}`}
          disabled={unseated.length === 0}
        />
      </div>

      {seated.length > 0 && (
        <ul className="mt-4" style={{ borderTop: "1px solid var(--color-outline)" }}>
          {seated.map((g) => (
            <GuestRow
              key={g.id}
              guest={g}
              side={sideOf(g)}
              sideOptions={sideOptions}
              onSide={(side) => onSide(g.id, side)}
              tableOptions={tableOptions}
              tableId={table.id}
              onTable={(tableId) => onSeat(g.id, tableId)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function Stepper({ value, noun, min, max, onChange }: { value: number; noun: string; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <StepButton label={`Remove a ${noun}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus size={14} />
      </StepButton>
      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{value}</span>
      <StepButton label={`Add a ${noun}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={14} />
      </StepButton>
    </div>
  );
}

/** Chairs per long side and per end; opposite sides always match. */
function FourSideSeats({ table, onChange }: { table: SeatingTable; onChange: (data: Partial<SeatingTable>) => void }) {
  const { long, ends } = fourSideCounts(table);
  const label = "text-[0.8125rem] font-medium";
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className={label} style={{ color: "var(--color-on-surface-variant)" }}>Each long side</span>
        <Stepper value={long} noun="chair on each long side" min={1} max={maxLongSeats(ends)} onChange={(n) => onChange(fourSided(n, ends))} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={label} style={{ color: "var(--color-on-surface-variant)" }}>Each end</span>
        <Stepper
          value={ends}
          noun="chair at each end"
          min={1}
          max={Math.min(MAX_END_SEATS, Math.floor(MAX_SEATS / 2) - 1)}
          onChange={(n) => onChange(fourSided(Math.min(long, maxLongSeats(n)), n))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={label} style={{ color: "var(--color-on-surface-variant)" }}>Seats</span>
        <span className="flex min-h-9 items-center text-sm tabular-nums" style={{ color: "var(--color-on-surface)" }}>
          {table.seats}
          <span className="ml-1.5 text-xs font-light" style={{ color: "var(--color-on-surface-muted)" }}>
            ({long} + {long} + {ends} + {ends})
          </span>
        </span>
      </div>
    </>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-container-high)] disabled:opacity-40"
      style={{ borderRadius: "var(--radius-full)", border: "1px solid var(--color-outline)", color: "var(--color-on-surface-variant)" }}
    >
      {children}
    </button>
  );
}

// ─── Guest row ───────────────────────────────────────────────────────────────

interface GuestRowProps {
  guest: GuestListEntry;
  side: GuestSide | undefined;
  sideOptions: SelectOption[];
  onSide: (side: GuestSide | null) => void;
  /** Omitted when there are no tables to move the guest to. */
  tableOptions?: SelectOption[];
  tableId?: string;
  onTable: (tableId: string | null) => void;
}

function GuestRow({ guest, side, sideOptions, onSide, tableOptions, tableId = "", onTable }: GuestRowProps) {
  const declined = guest.status === "declined";
  return (
    <li
      className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
      style={{ borderBottom: "1px solid var(--color-outline)" }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(GUEST_MIME, guest.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <span className="h-2.5 w-2.5 shrink-0" style={{ background: SIDE_COLOR[side ?? "none"], borderRadius: "var(--radius-full)" }} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm" style={{ color: "var(--color-on-surface)" }}>{guest.name}</span>
        <span className="block text-xs font-light" style={{ color: declined ? "var(--color-error)" : "var(--color-on-surface-muted)" }}>
          {guest.partySize > 1 ? `${guest.partySize} seats · ` : ""}
          {declined ? "Declined, doesn't need a seat" : guest.status[0].toUpperCase() + guest.status.slice(1)}
        </span>
      </span>
      <Select
        variant="chip"
        value={side ?? ""}
        options={sideOptions}
        onChange={(v) => onSide((v || null) as GuestSide | null)}
        aria-label={`Side for ${guest.name}`}
      />
      {tableOptions && (
        <Select
          variant="chip"
          value={tableId}
          options={tableOptions}
          onChange={(v) => onTable(v || null)}
          aria-label={`Table for ${guest.name}`}
        />
      )}
    </li>
  );
}
