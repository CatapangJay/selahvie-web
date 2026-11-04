"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWeddingStore } from "@/store/weddingStore";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import EmptyState from "@/components/ui/EmptyState";
import type { SelectOption } from "@/components/ui/Select";
import { configTier, hasModule, upgradePrice } from "@/lib/tiers";
import { downloadFile, formatPrice, toCsv } from "@/lib/utils";
import {
  MAX_ELEMENTS,
  MAX_TABLES,
  addElement,
  addTable,
  addTables,
  assign,
  duplicateElement,
  duplicateTable,
  elementsOf,
  guestsByTable,
  needsSeat,
  patchElement,
  patchTable,
  planOf,
  planTags,
  removeElement,
  removeTable,
  seatsFor,
  setSide,
  type ElementPreset,
} from "@/lib/seating";
import { partnerNames, sideOptions as buildSideOptions } from "@/lib/guestSides";
import type { GuestListEntry, SeatingPlan, GuestSide, SeatingTable, WeddingConfig } from "@/types/wedding";
import { Lock } from "lucide-react";
import FloorCanvas, { clampZoom } from "./seating/FloorCanvas";
import type { Selection } from "./seating/FloorSurface";
import GuestRail from "./seating/GuestRail";
import { ElementEditor, GuestRow, TableEditor } from "./seating/Editors";
import SeatingPrint from "./seating/SeatingPrint";
import Toolbar, { type PrintJob } from "./seating/Toolbar";
import { SEAT_FILL, newId, plural } from "./seating/shared";

interface Props {
  config: WeddingConfig;
  coupleLabel: string;
  onUpgrade: () => void;
  onOpenGuests: () => void;
}

const HISTORY_LIMIT = 60;

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

export default function SeatingPlanner({ config, coupleLabel, onUpgrade, onOpenGuests }: Props) {
  const personalized = hasModule(config, "seating");
  const updateConfig = useWeddingStore((s) => s.updateConfig);
  const updateGuest = useWeddingStore((s) => s.updateGuest);
  const allGuests = useWeddingStore((s) => s.guests);
  const guests = useMemo(() => allGuests.filter((g) => g.weddingId === config.id), [allGuests, config.id]);

  const plan = planOf(config);

  // ── History ──
  // Consecutive edits to the same field (typing a table name) collapse into one undo step.
  const [history, setHistory] = useState<{ past: SeatingPlan[]; future: SeatingPlan[]; lastKey: string | null }>({
    past: [],
    future: [],
    lastKey: null,
  });

  const write = (next: SeatingPlan) => updateConfig(config.id, { seatingPlan: next });
  const save = (next: SeatingPlan, key?: string) => {
    setHistory((h) => ({
      past: key && h.lastKey === key ? h.past : [...h.past, plan].slice(-HISTORY_LIMIT),
      future: [],
      lastKey: key ?? null,
    }));
    write(next);
  };
  const undo = () => {
    const prev = history.past.at(-1);
    if (!prev) return;
    setHistory((h) => ({ past: h.past.slice(0, -1), future: [...h.future, plan], lastKey: null }));
    write(prev);
  };
  const redo = () => {
    const next = history.future.at(-1);
    if (!next) return;
    setHistory((h) => ({ past: [...h.past, plan], future: h.future.slice(0, -1), lastKey: null }));
    write(next);
  };

  // Sides live on the guest; older plans kept them in seatingPlan.sides.
  const sideOf = (g: GuestListEntry): GuestSide | undefined => g.side ?? plan.sides[g.id];
  const changeSide = (guestId: string, side: GuestSide | null) => {
    updateGuest(guestId, { side: side ?? undefined });
    if (guestId in plan.sides) save(setSide(plan, guestId, null));
  };

  const [view, setView] = useState<"plan" | "list">("plan");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [tableQuery, setTableQuery] = useState("");
  const [zoom, setZoomState] = useState(1);
  const [locked, setLocked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [printJob, setPrintJob] = useState<PrintJob | null>(null);
  const setZoom = useCallback((z: number) => setZoomState(clampZoom(z)), []);
  const endPrint = useCallback(() => setPrintJob(null), []);

  const { p1, p2 } = partnerNames(config);
  const sideName = (side: GuestSide | undefined) => (side === "partner1" ? p1 : side === "partner2" ? p2 : "Not set");

  const byTable = guestsByTable(plan, guests);
  const tableById = new Map(plan.tables.map((t) => [t.id, t]));
  const tableOf = (g: GuestListEntry) => tableById.get(plan.assignments[g.id] ?? "");
  const seatable = guests.filter(needsSeat);
  const unseated = seatable.filter((g) => !tableOf(g)).sort((a, b) => a.name.localeCompare(b.name));

  const heads = (list: GuestListEntry[]) => list.reduce((n, g) => n + seatsFor(g), 0);
  const totalHeads = heads(seatable);
  const seatedHeads = heads(seatable.filter((g) => tableOf(g)));
  const capacity = plan.tables.reduce((n, t) => n + t.seats, 0);
  const sideHeads = (side: GuestSide) => heads(seatable.filter((g) => sideOf(g) === side));
  const unseatedHeads = totalHeads - seatedHeads;
  const shortBy = Math.max(0, totalHeads - capacity);
  const openSeats = Math.max(0, capacity - seatedHeads);

  const picked = guests.find((g) => g.id === pickedId);
  const selectedTable = selection?.type === "table" ? tableById.get(selection.id) : undefined;
  const selectedElement = selection?.type === "element" ? elementsOf(plan).find((e) => e.id === selection.id) : undefined;
  const elementsFull = elementsOf(plan).length >= MAX_ELEMENTS;
  const tags = planTags(plan);

  // Escape: cancel a pick, then leave focus view, then clear the selection.
  // Ctrl/⌘+Z undoes, Ctrl/⌘+Shift+Z or Ctrl+Y redoes, unless you're typing.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pickedId) setPickedId(null);
        else if (expanded && !document.querySelector(".popover-in")) setExpanded(false);
        return;
      }
      if (!personalized || isTyping(e.target) || !(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Focus view covers the page; stop the page behind it from scrolling.
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  const seatGuest = (guestId: string, tableId: string | null) => {
    save(assign(plan, guestId, tableId));
    setPickedId(null);
  };

  const add = (shape: SeatingTable["shape"]) => {
    const id = newId();
    save(addTable(plan, id, shape));
    setSelection({ type: "table", id });
  };

  const addMany = (count: number, shape: SeatingTable["shape"], seats: number) => {
    save(addTables(plan, Array.from({ length: count }, () => newId()), shape, seats));
  };

  const addFeature = (preset: ElementPreset) => {
    const id = newId("el");
    save(addElement(plan, id, preset));
    setSelection({ type: "element", id });
    setView("plan");
  };

  const deleteTable = (id: string) => {
    save(removeTable(plan, id));
    if (selection?.id === id) setSelection(null);
  };

  const deleteSelected = () => {
    if (!selection) return;
    if (selection.type === "table") deleteTable(selection.id);
    else {
      save(removeElement(plan, selection.id));
      setSelection(null);
    }
  };

  const exportCsv = () => {
    const rows: (string | number)[][] = [];
    for (const t of plan.tables) {
      for (const g of byTable.get(t.id) ?? []) rows.push([t.name, g.name, g.partySize, sideName(sideOf(g)), g.status, t.tag ?? ""]);
    }
    for (const g of unseated) rows.push(["Not seated", g.name, g.partySize, sideName(sideOf(g)), g.status, ""]);
    downloadFile(`${fileStem(coupleLabel)}-seating.csv`, toCsv(["Table", "Guest", "Party size", "Side", "RSVP", "Tag"], rows));
  };

  const sideOptions: SelectOption[] = buildSideOptions(config);
  const tableOptions: SelectOption[] = [
    { value: "", label: "Not seated" },
    ...plan.tables.map((t) => ({ value: t.id, label: t.name || "Untitled table" })),
  ];

  const tableEditor = (t: SeatingTable, onClose?: () => void) => (
    <TableEditor
      key={t.id}
      table={t}
      seated={byTable.get(t.id) ?? []}
      unseated={unseated}
      tags={tags}
      sideOptions={sideOptions}
      tableOptions={tableOptions}
      sideOf={sideOf}
      canDuplicate={plan.tables.length < MAX_TABLES}
      onSide={changeSide}
      onPatch={(data, key) => save(patchTable(plan, t.id, data), key)}
      onSeat={seatGuest}
      onDuplicate={() => {
        const id = newId();
        save(duplicateTable(plan, t.id, id));
        setSelection({ type: "table", id });
      }}
      onDelete={() => deleteTable(t.id)}
      onClose={onClose}
    />
  );

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

  const homeTableId = picked ? plan.assignments[picked.id] ?? null : null;

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
              Premium plan
            </p>
            <h2 className="headline-sm mt-2" style={{ fontSize: "1.35rem" }}>Plan your reception seating</h2>
            <p className="mt-2 max-w-md text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
              Lay out tables, the stage and dance floor on a floor plan, drag guests into seats, balance both sides of the
              family and print the chart for your venue.
            </p>
          </div>
          <div className="shrink-0">
            <ButtonPrimary size="lg" onClick={onUpgrade}>
              Upgrade for {formatPrice(upgradePrice(configTier(config), "premium"))}
            </ButtonPrimary>
            <p className="mt-2 text-center text-xs" style={{ color: "var(--color-on-surface-muted)" }}>
              One-time upgrade for this website
            </p>
          </div>
        </div>
      )}

      <div
        inert={!personalized}
        className={expanded ? "fixed inset-0 overflow-y-auto p-4 sm:p-6" : undefined}
        role={expanded ? "dialog" : undefined}
        aria-modal={expanded || undefined}
        aria-label={expanded ? "Seating plan, focus view" : undefined}
        style={{
          opacity: personalized ? 1 : 0.5,
          ...(expanded ? { zIndex: "var(--z-modal)", background: "var(--color-surface)" } : {}),
        }}
      >
        <div className={expanded ? "mx-auto max-w-[1600px] space-y-4" : "space-y-5"}>
          {/* Summary */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1 space-y-2.5">
              <p className="text-[0.9375rem]" style={{ color: "var(--color-on-surface-variant)" }}>
                <span className="text-xl font-medium tabular-nums" style={{ color: "var(--color-on-surface)" }}>
                  {seatedHeads}
                </span>{" "}
                of {plural(totalHeads, "guest")} seated
                {plan.tables.length > 0 && (
                  <>
                    <Dot />
                    {plural(plan.tables.length, "table")}, {capacity} seats
                    {shortBy === 0 && openSeats > 0 && <>, {openSeats} open</>}
                  </>
                )}
                {shortBy > 0 && plan.tables.length > 0 && (
                  <>
                    <Dot />
                    <span style={{ color: "var(--color-error)" }}>{shortBy} more {shortBy === 1 ? "seat" : "seats"} needed</span>
                  </>
                )}
              </p>
              <SeatingProgress
                total={totalHeads}
                p1={heads(seatable.filter((g) => tableOf(g) && sideOf(g) === "partner1"))}
                p2={heads(seatable.filter((g) => tableOf(g) && sideOf(g) === "partner2"))}
                seated={seatedHeads}
              />
            </div>
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-xs lg:justify-end" style={{ color: "var(--color-on-surface-variant)" }}>
              <SideKey color={SEAT_FILL.partner1} label={`${p1}'s side`} count={sideHeads("partner1")} />
              <SideKey color={SEAT_FILL.partner2} label={`${p2}'s side`} count={sideHeads("partner2")} />
              <SideKey color={SEAT_FILL.none} label="Side not set" count={totalHeads - sideHeads("partner1") - sideHeads("partner2")} />
              {unseatedHeads > 0 && <SideKey hollow label="Not seated" count={unseatedHeads} />}
            </p>
          </div>

          <Toolbar
            view={view}
            onView={setView}
            tableCount={plan.tables.length}
            elementsFull={elementsFull}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            onUndo={undo}
            onRedo={redo}
            onAddTable={add}
            onAddTables={addMany}
            onAddElement={addFeature}
            onExportCsv={exportCsv}
            onPrint={setPrintJob}
          />

          {view === "plan" ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="min-w-0 space-y-3">
                <FloorCanvas
                  plan={plan}
                  byTable={byTable}
                  sideOf={sideOf}
                  selection={selection}
                  picking={Boolean(picked)}
                  homeTableId={homeTableId}
                  query={tableQuery.toLowerCase()}
                  locked={locked}
                  zoom={zoom}
                  onZoom={setZoom}
                  onLocked={setLocked}
                  expanded={expanded}
                  onExpanded={setExpanded}
                  onQuery={setTableQuery}
                  onSelect={setSelection}
                  onTableClick={(id) => (pickedId ? seatGuest(pickedId, id) : setSelection({ type: "table", id }))}
                  onMoveTable={(id, x, y) => save(patchTable(plan, id, { x, y }))}
                  onPatchElement={(id, data) => save(patchElement(plan, id, data))}
                  onDropGuest={seatGuest}
                  onDeleteSelected={deleteSelected}
                  emptyState={<FirstTable onAdd={add} />}
                />

                <p
                  className="min-h-5 text-xs"
                  role="status"
                  style={{ color: picked ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)" }}
                >
                  {picked ? (
                    <>
                      Pick a table for <span className="font-medium">{picked.name}</span>
                      {homeTableId && tableById.get(homeTableId) ? <> (now at {tableById.get(homeTableId)!.name}, outlined)</> : null}. Press Esc to cancel.
                    </>
                  ) : locked ? (
                    "Layout locked. Tables and features stay put while you seat guests."
                  ) : plan.tables.length > 0 ? (
                    "Drag tables and room features to match your venue, then drag guests onto tables. Arrow keys nudge the focused item; Delete removes it."
                  ) : null}
                </p>

                {selectedTable && tableEditor(selectedTable, () => setSelection(null))}
                {selectedElement && (
                  <ElementEditor
                    key={selectedElement.id}
                    element={selectedElement}
                    canDuplicate={!elementsFull}
                    onPatch={(data, key) => save(patchElement(plan, selectedElement.id, data), key)}
                    onDuplicate={() => {
                      const id = newId("el");
                      save(duplicateElement(plan, selectedElement.id, id));
                      setSelection({ type: "element", id });
                    }}
                    onDelete={deleteSelected}
                    onClose={() => setSelection(null)}
                  />
                )}
              </div>

              <GuestRail
                guests={seatable}
                tableOf={tableOf}
                sideOf={sideOf}
                pickedId={pickedId}
                onPick={(id) => setPickedId((cur) => (cur === id ? null : id))}
                onUnseat={(id) => seatGuest(id, null)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {plan.tables.length === 0 ? (
                <EmptyState
                  title="No tables yet"
                  body="Add a round, long or half-moon table above, then seat guests from the list below. Switch to the floor plan any time to arrange the room."
                />
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">{plan.tables.map((t) => tableEditor(t))}</div>
              )}
              <section aria-labelledby="unseated-heading" className="pt-2">
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

      {printJob && (
        <SeatingPrint
          job={printJob}
          title={coupleLabel || "Seating plan"}
          plan={plan}
          byTable={byTable}
          seatable={seatable}
          tableOf={tableOf}
          sideOf={sideOf}
          onDone={endPrint}
        />
      )}
    </div>
  );
}

const fileStem = (label: string) => label.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "wedding";

function Dot() {
  return <span aria-hidden className="mx-2" style={{ color: "var(--color-outline)" }}>·</span>;
}

function FirstTable({ onAdd }: { onAdd: (shape: SeatingTable["shape"]) => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="headline-sm" style={{ fontWeight: 400 }}>Start with your first table</p>
      <p className="max-w-sm text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
        Add tables and room features like the stage or dance floor, drag them to match your venue, then drag guests onto
        their seats.
      </p>
      <div className="flex gap-2">
        <ButtonPrimary size="sm" onClick={() => onAdd("round")}>Add a round table</ButtonPrimary>
        <ButtonSecondary size="sm" onClick={() => onAdd("rect")}>Add a long table</ButtonSecondary>
      </div>
    </div>
  );
}

// ─── Summary ─────────────────────────────────────────────────────────────────

/** One bar: seated guests split by side; the rest of the track is still to seat. */
function SeatingProgress({ total, seated, p1, p2 }: { total: number; seated: number; p1: number; p2: number }) {
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);
  const unset = Math.max(0, seated - p1 - p2);
  const parts: [number, string][] = [
    [p1, SEAT_FILL.partner1],
    [p2, SEAT_FILL.partner2],
    [unset, SEAT_FILL.none],
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
        <span key={i} className="h-full transition-[width] duration-300 ease-out" style={{ width: `${pct(n)}%`, background: color }} />
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
