"use client";

import { useId } from "react";
import { Circle, Copy, RectangleHorizontal, RotateCw, Spline, Square, Trash2 } from "lucide-react";
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
  clampRotation,
  clampSeats,
  clampSweep,
  fourSideCounts,
  fourSided,
  maxLongSeats,
  seatsTaken,
} from "@/lib/seating";
import type { GuestListEntry, SeatingTable, VenueElement } from "@/types/wedding";
import { Stepper } from "./Editors";
import { Group, Row, RibbonInput, SmallButton, Stack } from "./RibbonParts";
import { HalfMoonIcon } from "./shared";

function RotationRows({ value, onChange }: { value: number; onChange: (deg: number) => void }) {
  return (
    <Group label="Rotate">
      <Stack>
        <Row label="Angle">
          <Stepper size="sm" value={value} noun="15° of rotation" step={15} min={-Infinity} max={Infinity} format={(v) => `${v}°`} onChange={(n) => onChange(clampRotation(n))} />
        </Row>
        <SmallButton icon={RotateCw} label="Rotate 90°" onClick={() => onChange(clampRotation(value + 90))} />
        <SmallButton icon={RotateCw} label="Reset" onClick={() => onChange(0)} disabled={value === 0} />
      </Stack>
    </Group>
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────

export function TableRibbon({ table, seated, unseated, tags, canDuplicate, onPatch, onSeat, onDuplicate, onDelete }: {
  table: SeatingTable;
  seated: GuestListEntry[];
  unseated: GuestListEntry[];
  tags: string[];
  canDuplicate: boolean;
  onPatch: (data: Partial<SeatingTable>, key?: string) => void;
  onSeat: (guestId: string, tableId: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const tagList = useId();
  const taken = seatsTaken(seated);
  const over = taken > table.seats;
  const free = table.seats - taken;
  const rect = table.shape === "rect";
  const four = rect && table.seatSides === 4;
  const { long, ends } = fourSideCounts(table);
  const addOptions: SelectOption[] = [
    { value: "", label: unseated.length ? "Seat a guest…" : "Everyone is seated" },
    ...unseated.map((g) => ({ value: g.id, label: g.partySize > 1 ? `${g.name} (${g.partySize})` : g.name })),
  ];
  const shape = (s: SeatingTable["shape"]) => ({ pressed: table.shape === s, onClick: () => onPatch({ shape: s }) });

  return (
    <>
      <Group label="Table">
        <div className="flex w-44 flex-col gap-1.5 pt-0.5">
          <RibbonInput
            aria-label="Table name"
            value={table.name}
            maxLength={40}
            onChange={(e) => onPatch({ name: e.target.value }, `name:${table.id}`)}
            onBlur={(e) => !e.target.value.trim() && onPatch({ name: "Untitled table" })}
          />
          <RibbonInput
            aria-label="Tag"
            placeholder="Tag: Family, Kids, VIP"
            list={tagList}
            value={table.tag ?? ""}
            maxLength={20}
            onChange={(e) => onPatch({ tag: e.target.value || undefined }, `tag:${table.id}`)}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== (table.tag ?? "")) onPatch({ tag: v || undefined });
            }}
          />
          <datalist id={tagList}>{tags.filter((t) => t !== table.tag).map((t) => <option key={t} value={t} />)}</datalist>
        </div>
      </Group>

      <Group label="Shape">
        <Stack>
          <SmallButton icon={Circle} label="Round" {...shape("round")} />
          <SmallButton icon={RectangleHorizontal} label="Long" {...shape("rect")} />
        </Stack>
        <Stack>
          <SmallButton icon={<HalfMoonIcon size={15} />} label="Half-moon" {...shape("arc")} />
          <SmallButton icon={Spline} label="Curved" {...shape("curve")} />
        </Stack>
      </Group>

      {rect && (
        <Group label="Chairs on">
          <Stack>
            {([[1, "One side"], [2, "Two sides"], [4, "All sides"]] as const).map(([n, label]) => (
              <SmallButton
                key={n}
                icon={<span aria-hidden className="text-[0.6875rem] font-semibold tabular-nums">{n}</span>}
                label={label}
                pressed={(table.seatSides ?? 2) === n}
                onClick={() => onPatch(n === 4 ? fourSided(long, ends) : { seatSides: n })}
              />
            ))}
          </Stack>
        </Group>
      )}

      {table.shape === "curve" && (
        <Group label="Curve">
          <Stack>
            <SmallButton icon={<HalfMoonIcon size={15} />} label="Single bend" pressed={!table.sBend} onClick={() => onPatch({ sBend: false })} />
            <SmallButton icon={Spline} label="S-curve" pressed={Boolean(table.sBend)} onClick={() => onPatch({ sBend: true })} />
            <Row label="Bend">
              <Stepper size="sm" value={table.sweep ?? 90} noun="15° of bend" step={15} min={MIN_SWEEP} max={MAX_SWEEP} format={(v) => `${v}°`} onChange={(n) => onPatch({ sweep: clampSweep(n) })} />
            </Row>
          </Stack>
        </Group>
      )}

      <Group label="Seats">
        <Stack>
          {four ? (
            <>
              <Row label="Each long">
                <Stepper size="sm" value={long} noun="chair on each long side" min={1} max={maxLongSeats(ends)} onChange={(n) => onPatch(fourSided(n, ends))} />
              </Row>
              <Row label="Each end">
                <Stepper
                  size="sm"
                  value={ends}
                  noun="chair at each end"
                  min={1}
                  max={Math.min(MAX_END_SEATS, Math.floor(MAX_SEATS / 2) - 1)}
                  onChange={(n) => onPatch(fourSided(Math.min(long, maxLongSeats(n)), n))}
                />
              </Row>
            </>
          ) : (
            <Row label="Chairs">
              <Stepper size="sm" value={table.seats} noun="seat" min={MIN_SEATS} max={MAX_SEATS} onChange={(n) => onPatch({ seats: clampSeats(n) })} />
            </Row>
          )}
          <p className="flex h-[23px] items-center px-1.5 text-xs tabular-nums" style={{ color: over ? "var(--color-error)" : "var(--color-on-surface-variant)" }}>
            {over
              ? `${taken - table.seats} over capacity: ${taken} guests for ${table.seats} seats`
              : `${taken} of ${table.seats} seats taken${free > 0 && taken > 0 ? `, ${free} free` : ""}`}
          </p>
        </Stack>
      </Group>

      <Group label="Guests">
        <div className="pt-1">
          <Select
            variant="chip"
            value=""
            options={addOptions}
            onChange={(id) => id && onSeat(id, table.id)}
            aria-label={`Seat a guest at ${table.name || "this table"}`}
            disabled={unseated.length === 0}
          />
        </div>
      </Group>

      {table.shape !== "round" && <RotationRows value={table.rotation ?? 0} onChange={(r) => onPatch({ rotation: r || undefined })} />}

      <Group label="Arrange" last>
        <Stack>
          <SmallButton icon={Copy} label="Duplicate" onClick={onDuplicate} disabled={!canDuplicate} />
          <SmallButton icon={Trash2} label="Delete table" tone="danger" onClick={onDelete} />
        </Stack>
      </Group>
    </>
  );
}

// ─── Room feature ────────────────────────────────────────────────────────────

export function ElementRibbon({ element, canDuplicate, onPatch, onDuplicate, onDelete }: {
  element: VenueElement;
  canDuplicate: boolean;
  onPatch: (data: Partial<VenueElement>, key?: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <Group label="Feature">
        <div className="w-44 pt-0.5">
          <RibbonInput
            aria-label="Label"
            value={element.label}
            maxLength={32}
            onChange={(e) => onPatch({ label: e.target.value }, `label:${element.id}`)}
            onBlur={(e) => !e.target.value.trim() && onPatch({ label: "Untitled area" })}
          />
        </div>
      </Group>
      <Group label="Shape">
        <Stack>
          <SmallButton icon={Square} label="Rectangle" pressed={element.shape === "rect"} onClick={() => onPatch({ shape: "rect" })} />
          <SmallButton icon={Circle} label="Oval" pressed={element.shape === "ellipse"} onClick={() => onPatch({ shape: "ellipse" })} />
        </Stack>
      </Group>
      <Group label="Size">
        <Stack>
          <Row label="Width">
            <Stepper size="sm" value={Math.round(element.w)} noun="unit of width" min={ELEMENT_MIN.w} max={ELEMENT_MAX.w} onChange={(n) => onPatch({ w: clampElementSize(n, "w") }, `w:${element.id}`)} />
          </Row>
          <Row label="Depth">
            <Stepper size="sm" value={Math.round(element.h)} noun="unit of depth" min={ELEMENT_MIN.h} max={ELEMENT_MAX.h} onChange={(n) => onPatch({ h: clampElementSize(n, "h") }, `h:${element.id}`)} />
          </Row>
          <p className="flex h-[23px] items-center px-1.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>Or drag the corner handle</p>
        </Stack>
      </Group>
      <RotationRows value={element.rotation ?? 0} onChange={(r) => onPatch({ rotation: r || undefined })} />
      <Group label="Arrange" last>
        <Stack>
          <SmallButton icon={Copy} label="Duplicate" onClick={onDuplicate} disabled={!canDuplicate} />
          <SmallButton icon={Trash2} label="Remove" tone="danger" onClick={onDelete} />
        </Stack>
      </Group>
    </>
  );
}
