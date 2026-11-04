"use client";

import { useId, type ReactNode } from "react";
import { Circle, Copy, Minus, Plus, RectangleHorizontal, RotateCw, Spline, Square, Trash2, X } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import Select, { type SelectOption } from "@/components/ui/Select";
import {
  ELEMENT_MAX,
  ELEMENT_MIN,
  MAX_END_SEATS,
  MAX_SEATS,
  MAX_SWEEP,
  MIN_SEATS,
  MIN_SWEEP,
  clampElementSize,
  clampSweep,
  clampRotation,
  clampSeats,
  fourSideCounts,
  fourSided,
  maxLongSeats,
  seatsTaken,
} from "@/lib/seating";
import type { GuestListEntry, GuestSide, SeatingTable, VenueElement } from "@/types/wedding";
import { Avatar } from "./FloorSurface";
import { ELEMENT_ICON, GUEST_MIME, HalfMoonIcon, statusLabel } from "./shared";

const LABEL = "text-[0.8125rem] font-medium";
const LABEL_STYLE = { color: "var(--color-on-surface-variant)" } as const;

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section
      aria-label={label}
      className="p-5 sm:p-6"
      style={{ background: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
    >
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={LABEL} style={LABEL_STYLE}>{label}</span>
      {children}
    </div>
  );
}

function Chips<T extends string | number>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: readonly (readonly [T, string, ReactNode?])[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1" role="group" aria-label={label}>
      {options.map(([v, text, icon]) => {
        const on = value === v;
        return (
          <button
            key={String(v)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(v)}
            className="inline-flex min-h-[36px] items-center gap-1.5 px-3 text-sm transition-colors hover:border-[var(--color-on-surface-variant)]"
            style={{
              borderRadius: "var(--radius-full)",
              border: `1px solid ${on ? "var(--color-primary)" : "var(--color-outline)"}`,
              background: on ? "var(--color-primary-container)" : "transparent",
              color: on ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)",
            }}
          >
            {icon}
            {text}
          </button>
        );
      })}
    </div>
  );
}

function ItemActions({ deleteLabel, onDuplicate, duplicateDisabled, onDelete, onClose, closeLabel }: {
  deleteLabel: string;
  onDuplicate: () => void;
  duplicateDisabled?: boolean;
  onDelete: () => void;
  onClose?: () => void;
  closeLabel: string;
}) {
  return (
    <div className="ml-auto flex items-center gap-1">
      <button
        type="button"
        onClick={onDuplicate}
        disabled={duplicateDisabled}
        className="inline-flex min-h-[36px] items-center gap-1.5 px-3 text-sm transition-colors hover:bg-[var(--color-surface-container-low)] disabled:cursor-not-allowed disabled:opacity-40"
        style={{ color: "var(--color-on-surface-variant)", borderRadius: "var(--radius-sm)" }}
      >
        <Copy size={14} aria-hidden /> Duplicate
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex min-h-[36px] items-center gap-1.5 px-3 text-sm transition-colors hover:bg-[var(--color-error-container)]"
        style={{ color: "var(--color-error)", borderRadius: "var(--radius-sm)" }}
      >
        <Trash2 size={14} aria-hidden /> {deleteLabel}
      </button>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-container-high)]"
          style={{ borderRadius: "var(--radius-full)", color: "var(--color-on-surface-variant)" }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────

interface TableEditorProps {
  table: SeatingTable;
  seated: GuestListEntry[];
  unseated: GuestListEntry[];
  tags: string[];
  sideOptions: SelectOption[];
  tableOptions: SelectOption[];
  sideOf: (g: GuestListEntry) => GuestSide | undefined;
  canDuplicate: boolean;
  onSide: (guestId: string, side: GuestSide | null) => void;
  /** `key` lets typing in one field collapse into a single undo step. */
  onPatch: (data: Partial<SeatingTable>, key?: string) => void;
  onSeat: (guestId: string, tableId: string | null) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose?: () => void;
}

export function TableEditor({
  table, seated, unseated, tags, sideOptions, tableOptions, sideOf, canDuplicate,
  onSide, onPatch, onSeat, onDuplicate, onDelete, onClose,
}: TableEditorProps) {
  const nameId = useId();
  const tagId = useId();
  const taken = seatsTaken(seated);
  const over = taken > table.seats;
  const free = table.seats - taken;
  const rotation = table.rotation ?? 0;
  const addOptions: SelectOption[] = [
    { value: "", label: unseated.length ? "Seat a guest…" : "Everyone is seated" },
    ...unseated.map((g) => ({ value: g.id, label: g.partySize > 1 ? `${g.name} (${g.partySize})` : g.name })),
  ];

  return (
    <Panel label={table.name || "Untitled table"}>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="min-w-44 flex-1">
          <InputField
            id={nameId}
            label="Table name"
            value={table.name}
            maxLength={40}
            onChange={(e) => onPatch({ name: e.target.value }, `name:${table.id}`)}
            onBlur={(e) => {
              if (!e.target.value.trim()) onPatch({ name: "Untitled table" });
            }}
          />
        </div>
        <div className="w-40">
          <InputField
            id={tagId}
            label="Tag"
            value={table.tag ?? ""}
            maxLength={20}
            placeholder="Family, Kids, VIP"
            list={`${tagId}-list`}
            onChange={(e) => onPatch({ tag: e.target.value || undefined }, `tag:${table.id}`)}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (table.tag ?? "")) onPatch({ tag: v || undefined });
            }}
          />
          <datalist id={`${tagId}-list`}>
            {tags.filter((t) => t !== table.tag).map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>
        <ItemActions
          deleteLabel="Delete table"
          onDuplicate={onDuplicate}
          duplicateDisabled={!canDuplicate}
          onDelete={onDelete}
          onClose={onClose}
          closeLabel="Close table details"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-4">
        <Field label="Shape">
          <Chips
            label="Table shape"
            value={table.shape}
            onChange={(shape) => onPatch({ shape })}
            options={[
              ["round", "Round", <Circle key="i" size={13} aria-hidden />],
              ["rect", "Long", <RectangleHorizontal key="i" size={13} aria-hidden />],
              ["arc", "Half-moon", <HalfMoonIcon key="i" size={13} />],
              ["curve", "Curved", <Spline key="i" size={13} aria-hidden />],
            ]}
          />
        </Field>

        {table.shape === "curve" && (
          <>
            <Field label="Curve">
              <Chips
                label="Curve"
                value={table.sBend ? "s" : "arc"}
                onChange={(v) => onPatch({ sBend: v === "s" })}
                options={[["arc", "Single bend"], ["s", "S-curve"]] as const}
              />
            </Field>
            <Field label="Bend">
              <Stepper
                value={table.sweep ?? 90}
                noun="15° of bend"
                step={15}
                min={MIN_SWEEP}
                max={MAX_SWEEP}
                format={(v) => `${v}°`}
                onChange={(n) => onPatch({ sweep: clampSweep(n) })}
              />
            </Field>
          </>
        )}

        {table.shape === "rect" && (
          <Field label="Chairs on">
            <Chips
              label="Chairs on"
              value={table.seatSides ?? 2}
              onChange={(count) => {
                if (count === 4) {
                  const { long, ends } = fourSideCounts(table);
                  onPatch(fourSided(long, ends));
                } else onPatch({ seatSides: count });
              }}
              options={[[1, "One side"], [2, "Two sides"], [4, "All sides"]] as const}
            />
          </Field>
        )}

        {table.shape === "rect" && table.seatSides === 4 ? (
          <FourSideSeats table={table} onChange={(d) => onPatch(d)} />
        ) : (
          <Field label="Seats">
            <Stepper value={table.seats} noun="seat" min={MIN_SEATS} max={MAX_SEATS} onChange={(n) => onPatch({ seats: clampSeats(n) })} />
          </Field>
        )}

        {table.shape !== "round" && (
          <Field label="Rotation">
            <RotationControl value={rotation} onChange={(r) => onPatch({ rotation: r || undefined })} />
          </Field>
        )}
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

      {seated.length > 0 ? (
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
      ) : (
        <p className="mt-4 text-sm" style={{ color: "var(--color-on-surface-variant)", borderTop: "1px solid var(--color-outline)", paddingTop: "1rem" }}>
          Drag guests onto this table, or pick one above.
        </p>
      )}
    </Panel>
  );
}

/** Chairs per long side and per end; opposite sides always match. */
function FourSideSeats({ table, onChange }: { table: SeatingTable; onChange: (data: Partial<SeatingTable>) => void }) {
  const { long, ends } = fourSideCounts(table);
  return (
    <>
      <Field label="Each long side">
        <Stepper value={long} noun="chair on each long side" min={1} max={maxLongSeats(ends)} onChange={(n) => onChange(fourSided(n, ends))} />
      </Field>
      <Field label="Each end">
        <Stepper
          value={ends}
          noun="chair at each end"
          min={1}
          max={Math.min(MAX_END_SEATS, Math.floor(MAX_SEATS / 2) - 1)}
          onChange={(n) => onChange(fourSided(Math.min(long, maxLongSeats(n)), n))}
        />
      </Field>
      <Field label="Seats">
        <span className="flex min-h-9 items-center text-sm tabular-nums" style={{ color: "var(--color-on-surface)" }}>
          {table.seats}
          <span className="ml-1.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
            ({long} + {long} + {ends} + {ends})
          </span>
        </span>
      </Field>
    </>
  );
}

// ─── Room feature ────────────────────────────────────────────────────────────

interface ElementEditorProps {
  element: VenueElement;
  canDuplicate: boolean;
  onPatch: (data: Partial<VenueElement>, key?: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ElementEditor({ element, canDuplicate, onPatch, onDuplicate, onDelete, onClose }: ElementEditorProps) {
  const labelId = useId();
  const Icon = ELEMENT_ICON[element.kind];
  return (
    <Panel label={element.label || "Room feature"}>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <span
          aria-hidden
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center"
          style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-sm)", color: "var(--color-on-surface-variant)" }}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-44 flex-1">
          <InputField
            id={labelId}
            label="Label"
            value={element.label}
            maxLength={32}
            onChange={(e) => onPatch({ label: e.target.value }, `label:${element.id}`)}
            onBlur={(e) => {
              if (!e.target.value.trim()) onPatch({ label: "Untitled area" });
            }}
          />
        </div>
        <ItemActions
          deleteLabel="Remove"
          onDuplicate={onDuplicate}
          duplicateDisabled={!canDuplicate}
          onDelete={onDelete}
          onClose={onClose}
          closeLabel="Close feature details"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-4">
        <Field label="Shape">
          <Chips
            label="Feature shape"
            value={element.shape}
            onChange={(shape) => onPatch({ shape })}
            options={[
              ["rect", "Rectangle", <Square key="i" size={13} aria-hidden />],
              ["ellipse", "Oval", <Circle key="i" size={13} aria-hidden />],
            ]}
          />
        </Field>
        <Field label="Width">
          <Stepper
            value={Math.round(element.w)}
            noun="unit of width"
            min={ELEMENT_MIN.w}
            max={ELEMENT_MAX.w}
            onChange={(n) => onPatch({ w: clampElementSize(n, "w") }, `w:${element.id}`)}
          />
        </Field>
        <Field label="Depth">
          <Stepper
            value={Math.round(element.h)}
            noun="unit of depth"
            min={ELEMENT_MIN.h}
            max={ELEMENT_MAX.h}
            onChange={(n) => onPatch({ h: clampElementSize(n, "h") }, `h:${element.id}`)}
          />
        </Field>
        <Field label="Rotation">
          <RotationControl value={element.rotation ?? 0} onChange={(r) => onPatch({ rotation: r || undefined })} />
        </Field>
      </div>
      <p className="mt-4 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
        Drag the corner handle on the floor plan to resize freely.
      </p>
    </Panel>
  );
}

// ─── Controls ────────────────────────────────────────────────────────────────

function RotationControl({ value, onChange }: { value: number; onChange: (deg: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <Stepper value={value} noun="15° of rotation" step={15} min={-Infinity} max={Infinity} format={(v) => `${v}°`} onChange={(n) => onChange(clampRotation(n))} />
      <button
        type="button"
        onClick={() => onChange(clampRotation(value + 90))}
        className="ml-1 inline-flex min-h-[36px] items-center gap-1.5 px-2.5 text-sm transition-colors hover:bg-[var(--color-surface-container-low)]"
        style={{ borderRadius: "var(--radius-sm)", color: "var(--color-on-surface-variant)" }}
      >
        <RotateCw size={14} aria-hidden /> 90°
      </button>
    </div>
  );
}

export function Stepper({ value, noun, min, max, step = 1, format, onChange }: {
  value: number;
  noun: string;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <StepButton label={`Remove ${step === 1 ? "a" : ""} ${noun}`.replace(/\s+/g, " ")} disabled={value <= min} onClick={() => onChange(value - step)}>
        <Minus size={14} />
      </StepButton>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">{format ? format(value) : value}</span>
      <StepButton label={`Add ${step === 1 ? "a" : ""} ${noun}`.replace(/\s+/g, " ")} disabled={value >= max} onClick={() => onChange(value + step)}>
        <Plus size={14} />
      </StepButton>
    </div>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-container-high)] disabled:cursor-not-allowed disabled:opacity-40"
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

export function GuestRow({ guest, side, sideOptions, onSide, tableOptions, tableId = "", onTable }: GuestRowProps) {
  const declined = guest.status === "declined";
  return (
    <li
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5"
      style={{ borderBottom: "1px solid var(--color-outline)" }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(GUEST_MIME, guest.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <Avatar name={guest.name} side={side} size={30} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm" style={{ color: "var(--color-on-surface)" }}>{guest.name}</span>
        <span className="block text-xs" style={{ color: declined ? "var(--color-error)" : "var(--color-on-surface-variant)" }}>
          {guest.partySize > 1 ? `${guest.partySize} seats · ` : ""}
          {declined ? "Declined, doesn't need a seat" : statusLabel(guest.status)}
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
