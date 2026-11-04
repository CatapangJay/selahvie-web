"use client";

import { isValidElement, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Circle,
  Download,
  LayoutGrid,
  List,
  ListOrdered,
  Plus,
  Printer,
  RectangleHorizontal,
  Redo2,
  Shapes,
  Spline,
  Square,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import Popover from "@/components/ui/Popover";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import { CUSTOM_PRESETS, DEFAULT_SEATS, ELEMENT_PRESETS, MAX_SEATS, MAX_TABLES, MIN_SEATS, type ElementPreset } from "@/lib/seating";
import type { SeatingTable } from "@/types/wedding";
import { Stepper } from "./Editors";
import { ELEMENT_ICON, HalfMoonIcon } from "./shared";

export type PrintView = "plan" | "tables" | "lookup";
export interface PrintJob {
  view: PrintView;
  names: boolean;
}

interface Props {
  view: "plan" | "list";
  onView: (v: "plan" | "list") => void;
  tableCount: number;
  elementsFull: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAddTable: (shape: SeatingTable["shape"]) => void;
  onAddTables: (count: number, shape: SeatingTable["shape"], seats: number) => void;
  onAddElement: (preset: ElementPreset) => void;
  onExportCsv: () => void;
  onPrint: (job: PrintJob) => void;
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export default function Toolbar(p: Props) {
  const tablesFull = p.tableCount >= MAX_TABLES;
  const mod = isMac() ? "⌘" : "Ctrl+";
  return (
    <div
      className="flex flex-wrap items-stretch gap-y-2 p-1.5"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)" }}
    >
      <Group label="Tables">
        <ToolButton icon={Circle} label="Round table" onClick={() => p.onAddTable("round")} disabled={tablesFull} />
        <ToolButton icon={RectangleHorizontal} label="Long table" onClick={() => p.onAddTable("rect")} disabled={tablesFull} />
        <ToolButton icon={<HalfMoonIcon size={17} />} label="Half-moon" onClick={() => p.onAddTable("arc")} disabled={tablesFull} />
        <ToolButton icon={Spline} label="S-curve" onClick={() => p.onAddTable("curve")} disabled={tablesFull} />
        <AddSeveral disabled={tablesFull} room={MAX_TABLES - p.tableCount} onAdd={p.onAddTables} />
      </Group>
      <Group label="Room">
        <RoomFeatures disabled={p.elementsFull} onAdd={p.onAddElement} />
      </Group>
      <Group label="View">
        <ToolButton icon={LayoutGrid} label="Floor plan" pressed={p.view === "plan"} onClick={() => p.onView("plan")} />
        <ToolButton icon={List} label="List" pressed={p.view === "list"} onClick={() => p.onView("list")} />
      </Group>
      <Group label="Export">
        <PrintMenu disabled={p.tableCount === 0} onPrint={p.onPrint} />
        <ToolButton icon={Download} label="CSV" ariaLabel="Export seating chart as CSV" title="Export CSV" onClick={p.onExportCsv} disabled={p.tableCount === 0} />
      </Group>
      <Group label="Edit" last>
        <ToolButton icon={Undo2} label="Undo" title={`Undo (${mod}Z)`} onClick={p.onUndo} disabled={!p.canUndo} />
        <ToolButton icon={Redo2} label="Redo" title={`Redo (${mod}Shift+Z)`} onClick={p.onRedo} disabled={!p.canRedo} />
      </Group>
    </div>
  );
}

function Group({ label, last, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col px-1" style={{ borderRight: last ? "none" : "1px solid var(--color-outline)" }}>
      <div className="flex flex-1 items-start gap-0.5">{children}</div>
      <span className="pt-1 text-center text-[0.6875rem]" style={{ color: "var(--color-on-surface-variant)" }} aria-hidden>
        {label}
      </span>
    </div>
  );
}

interface ToolButtonProps {
  icon: LucideIcon | ReactNode;
  label: string;
  ariaLabel?: string;
  title?: string;
  pressed?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  onClick: () => void;
  menu?: boolean;
}

const ToolButtonInner = ({ icon, label, pressed, menu }: Pick<ToolButtonProps, "icon" | "label" | "pressed" | "menu">) => {
  const Icon = isValidElement(icon) ? null : (icon as LucideIcon);
  return (
    <>
      <span
        aria-hidden
        className="inline-flex h-9 w-9 items-center justify-center transition-colors group-hover:bg-[var(--color-surface-container-high)] group-disabled:bg-transparent"
        style={{
          borderRadius: "var(--radius-sm)",
          background: pressed ? "var(--color-primary)" : "var(--color-surface-container)",
          color: pressed ? "#fff" : "var(--color-on-surface-variant)",
        }}
      >
        {Icon ? <Icon size={17} /> : (icon as ReactNode)}
      </span>
      <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
        {label}
        {menu && <ChevronDown size={11} aria-hidden />}
      </span>
    </>
  );
};

function ToolButton({ icon, label, ariaLabel, title, pressed, disabled, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      title={title}
      className="group inline-flex min-w-[3.75rem] flex-col items-center gap-1 px-1.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      style={{ color: pressed ? "var(--color-on-surface)" : "var(--color-on-surface-variant)", fontWeight: pressed ? 500 : 400, borderRadius: "var(--radius-sm)" }}
    >
      <ToolButtonInner icon={icon} label={label} pressed={pressed && !disabled} />
    </button>
  );
}

/** A toolbar button that opens a panel. Escape or a press outside closes it. */
function MenuButton({ icon, label, disabled, children }: { icon: LucideIcon | ReactNode; label: string; disabled?: boolean; children: (close: () => void) => ReactNode }) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const anchorRef = useMemo(() => ({ current: anchor }), [anchor]);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    anchor?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      anchor?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, anchor]);

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="group inline-flex min-w-[3.75rem] flex-col items-center gap-1 px-1.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{ color: open ? "var(--color-on-surface)" : "var(--color-on-surface-variant)", borderRadius: "var(--radius-sm)" }}
      >
        <ToolButtonInner icon={icon} label={label} pressed={open} menu />
      </button>
      {open && (
        <Popover anchorRef={anchorRef} onDismiss={() => setOpen(false)} role="dialog" aria-label={label} className="p-4">
          {children(close)}
        </Popover>
      )}
    </>
  );
}

function AddSeveral({ disabled, room, onAdd }: { disabled: boolean; room: number; onAdd: Props["onAddTables"] }) {
  const [count, setCount] = useState(5);
  const [shape, setShape] = useState<SeatingTable["shape"]>("round");
  const [seats, setSeats] = useState(DEFAULT_SEATS.round);
  const n = Math.min(count, room);
  return (
    <MenuButton icon={Plus} label="Several" disabled={disabled}>
      {(close) => (
        <div className="w-72 space-y-4">
          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Add several tables</p>
          <div className="grid grid-cols-4 gap-1" role="group" aria-label="Shape">
            {([["round", "Round", <Circle key="i" size={15} aria-hidden />], ["rect", "Long", <RectangleHorizontal key="i" size={15} aria-hidden />], ["arc", "Half-moon", <HalfMoonIcon key="i" size={15} />], ["curve", "S-curve", <Spline key="i" size={15} aria-hidden />]] as const).map(([s, text, icon]) => (
              <button
                key={s}
                type="button"
                aria-pressed={shape === s}
                onClick={() => {
                  setShape(s);
                  setSeats(DEFAULT_SEATS[s]);
                }}
                className="flex min-h-[52px] flex-col items-center justify-center gap-1 text-xs transition-colors hover:border-[var(--color-on-surface-variant)]"
                style={{
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${shape === s ? "var(--color-primary)" : "var(--color-outline)"}`,
                  background: shape === s ? "var(--color-primary-container)" : "transparent",
                  color: shape === s ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)",
                }}
              >
                {icon}
                {text}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Tables</span>
            <Stepper value={count} noun="table" min={1} max={Math.min(30, room)} onChange={setCount} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Seats each</span>
            <Stepper value={seats} noun="seat" min={MIN_SEATS} max={MAX_SEATS} onChange={setSeats} />
          </div>
          <ButtonPrimary
            size="sm"
            className="w-full"
            onClick={() => {
              onAdd(n, shape, seats);
              close();
            }}
          >
            Add {n} {n === 1 ? "table" : "tables"} · {n * seats} seats
          </ButtonPrimary>
        </div>
      )}
    </MenuButton>
  );
}

function RoomFeatures({ disabled, onAdd }: { disabled: boolean; onAdd: (preset: ElementPreset) => void }) {
  return (
    <MenuButton icon={Shapes} label="Features" disabled={disabled}>
      {(close) => {
        const pick = (preset: ElementPreset) => {
          onAdd(preset);
          close();
        };
        return (
          <div className="w-[19rem] space-y-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Add to the room</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>Drag it into place, then resize from the corner.</p>
            </div>
            <ul className="grid grid-cols-2 gap-1">
              {ELEMENT_PRESETS.map((preset) => {
                const Icon = ELEMENT_ICON[preset.kind];
                return (
                  <li key={preset.kind}>
                    <button
                      type="button"
                      onClick={() => pick(preset)}
                      className="flex min-h-[40px] w-full items-center gap-2.5 px-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-container-low)]"
                      style={{ borderRadius: "var(--radius-sm)", color: "var(--color-on-surface)" }}
                    >
                      <Icon size={15} aria-hidden style={{ color: "var(--color-on-surface-variant)" }} />
                      {preset.label}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div style={{ borderTop: "1px solid var(--color-outline)" }} className="pt-3">
              <p className="mb-1.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>Custom shape, labelled however you like</p>
              <div className="grid grid-cols-2 gap-1">
                <CustomButton icon={<Square size={15} aria-hidden />} label="Rectangle" onClick={() => pick(CUSTOM_PRESETS.rect)} />
                <CustomButton icon={<Circle size={15} aria-hidden />} label="Oval" onClick={() => pick(CUSTOM_PRESETS.ellipse)} />
              </div>
            </div>
          </div>
        );
      }}
    </MenuButton>
  );
}

function CustomButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[40px] items-center gap-2.5 px-2.5 text-sm transition-colors hover:bg-[var(--color-surface-container-low)]"
      style={{ borderRadius: "var(--radius-sm)", border: "1px dashed var(--color-outline)", color: "var(--color-on-surface)" }}
    >
      <span style={{ color: "var(--color-on-surface-variant)" }}>{icon}</span>
      {label}
    </button>
  );
}

const PRINT_VIEWS: [PrintView, string, string, LucideIcon][] = [
  ["plan", "Floor plan", "The room as you laid it out", LayoutGrid],
  ["tables", "Table list", "Every table with its guests", List],
  ["lookup", "Guest lookup", "A to Z, with table numbers, for the entrance", ListOrdered],
];

function PrintMenu({ disabled, onPrint }: { disabled: boolean; onPrint: (job: PrintJob) => void }) {
  const [view, setView] = useState<PrintView>("plan");
  const [names, setNames] = useState(true);
  return (
    <MenuButton icon={Printer} label="Print" disabled={disabled}>
      {(close) => (
        <div className="w-72 space-y-4">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Print the seating plan</p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>Choose Save as PDF in the print dialog for a file.</p>
          </div>
          <fieldset className="space-y-1.5">
            <legend className="sr-only">What to print</legend>
            {PRINT_VIEWS.map(([id, title, desc, Icon]) => (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-3 p-2.5 transition-colors hover:bg-[var(--color-surface-container-low)]"
                style={{
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${view === id ? "var(--color-primary)" : "var(--color-outline)"}`,
                  background: view === id ? "var(--color-primary-container)" : undefined,
                }}
              >
                <input type="radio" name="print-view" value={id} checked={view === id} onChange={() => setView(id)} className="sr-only" />
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{
                    borderRadius: "var(--radius-sm)",
                    background: view === id ? "var(--color-primary)" : "var(--color-surface-container)",
                    color: view === id ? "#fff" : "var(--color-on-surface-variant)",
                  }}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm" style={{ color: "var(--color-on-surface)" }}>{title}</span>
                  <span className="block text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{desc}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {view === "plan" && (
            <label className="flex cursor-pointer items-start gap-2.5 text-sm" style={{ color: "var(--color-on-surface)" }}>
              <input type="checkbox" checked={names} onChange={(e) => setNames(e.target.checked)} className="mt-0.5 accent-[var(--color-primary)]" />
              <span>
                Include guest names
                <span className="block text-xs" style={{ color: "var(--color-on-surface-variant)" }}>Adds each table’s guests below the plan</span>
              </span>
            </label>
          )}
          <ButtonPrimary
            size="sm"
            className="w-full"
            onClick={() => {
              onPrint({ view, names });
              close();
            }}
          >
            <Printer size={14} aria-hidden /> Print
          </ButtonPrimary>
        </div>
      )}
    </MenuButton>
  );
}
