"use client";

import { useId, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import {
  ChevronUp,
  Circle,
  Download,
  Expand,
  LayoutGrid,
  List,
  ListOrdered,
  Lock,
  LockOpen,
  Plus,
  Printer,
  RectangleHorizontal,
  Redo2,
  Search,
  Shapes,
  Shrink,
  Spline,
  Square,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import { CUSTOM_PRESETS, DEFAULT_SEATS, ELEMENT_PRESETS, MAX_SEATS, MAX_TABLES, MIN_SEATS, type ElementPreset } from "@/lib/seating";
import type { SeatingTable, VenueElementKind } from "@/types/wedding";
import { Stepper } from "./Editors";
import { Group, LargeButton, MenuButton, QuickButton, SmallButton, Stack } from "./RibbonParts";
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
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  locked: boolean;
  onLocked: (v: boolean) => void;
  expanded: boolean;
  onExpanded: (v: boolean) => void;
  onExportCsv: () => void;
  onPrint: (job: PrintJob) => void;
  /** A contextual tab for the current selection ("Table", "Feature"); it opens when the selection changes. */
  context?: { key: string; label: string; content: ReactNode };
}

type TabId = "plan" | "home" | "view" | "export" | "context";

/** Wide enough (with the sidebar) to lay every group out in one row. */
const WIDE_QUERY = "(min-width: 1420px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useWide = () => useSyncExternalStore(subscribe, () => window.matchMedia(WIDE_QUERY).matches, () => true);

const COLLAPSE_KEY = "selahvie:seating-ribbon-collapsed";
const preset = (kind: VenueElementKind) => ELEMENT_PRESETS.find((p) => p.kind === kind)!;
const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * An Office-style ribbon. On wide screens every group sits in one row under a
 * single "Plan" tab; narrower screens split them into Home, View and Export.
 * Selecting a table or feature adds its own tab, and the ribbon can collapse to
 * just its tab strip.
 */
export default function Toolbar(p: Props) {
  const wide = useWide();
  const baseId = useId();
  const [tab, setTab] = useState<TabId>("plan");
  const [names, setNames] = useState(true);
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && localStorage.getItem(COLLAPSE_KEY) === "1");

  // Jump to the contextual tab when something new is selected; leave it when nothing is.
  const [seenKey, setSeenKey] = useState(p.context?.key);
  if (seenKey !== p.context?.key) {
    setSeenKey(p.context?.key);
    if (p.context) setTab("context");
    else if (tab === "context") setTab("plan");
  }

  const tabs: [TabId, string][] = [
    ...((wide ? [["plan", "Plan"]] : [["home", "Home"], ["view", "View"], ["export", "Export"]]) as [TabId, string][]),
    ...(p.context ? ([["context", p.context.label]] as [TabId, string][]) : []),
  ];
  // "plan" and "home" are the same starting tab at different widths.
  const active: TabId = tabs.some(([id]) => id === tab) ? tab : tab === "context" ? tabs[0][0] : wide ? "plan" : "home";

  const toggleCollapsed = (v: boolean) => {
    setCollapsed(v);
    localStorage.setItem(COLLAPSE_KEY, v ? "1" : "0");
  };
  const pick = (id: TabId) => {
    setTab(id);
    if (collapsed) toggleCollapsed(false);
  };
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = tabs.findIndex(([id]) => id === active);
    const next = tabs[(i + step + tabs.length) % tabs.length][0];
    pick(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  const tablesFull = p.tableCount >= MAX_TABLES;
  const nothing = p.tableCount === 0;
  const notPlan = p.view !== "plan";
  const mod = isMac() ? "⌘" : "Ctrl+";

  const tables = (
    <Group label="Tables">
      <LargeButton icon={Circle} label="Round table" onClick={() => p.onAddTable("round")} disabled={tablesFull} />
      <Stack>
        <SmallButton icon={RectangleHorizontal} label="Long table" onClick={() => p.onAddTable("rect")} disabled={tablesFull} />
        <SmallButton icon={<HalfMoonIcon size={15} />} label="Half-moon" onClick={() => p.onAddTable("arc")} disabled={tablesFull} />
        <SmallButton icon={Spline} label="S-curve" onClick={() => p.onAddTable("curve")} disabled={tablesFull} />
      </Stack>
      <AddSeveral disabled={tablesFull} room={MAX_TABLES - p.tableCount} onAdd={p.onAddTables} />
    </Group>
  );
  const room = (
    <Group label="Room">
      <RoomFeatures disabled={p.elementsFull} onAdd={p.onAddElement} />
      <Stack>
        {(["stage", "danceFloor", "grazing"] as const).map((k) => (
          <SmallButton key={k} icon={ELEMENT_ICON[k]} label={preset(k).label} onClick={() => p.onAddElement(preset(k))} disabled={p.elementsFull} />
        ))}
      </Stack>
      <Stack>
        <SmallButton icon={ELEMENT_ICON.photobooth} label="Photo booth" onClick={() => p.onAddElement(preset("photobooth"))} disabled={p.elementsFull} />
        <SmallButton icon={Square} label="Custom area" onClick={() => p.onAddElement(CUSTOM_PRESETS.rect)} disabled={p.elementsFull} />
        <SmallButton icon={Circle} label="Custom oval" onClick={() => p.onAddElement(CUSTOM_PRESETS.ellipse)} disabled={p.elementsFull} />
      </Stack>
    </Group>
  );
  const show = (
    <Stack>
      <SmallButton icon={LayoutGrid} label="Floor plan" pressed={p.view === "plan"} onClick={() => p.onView("plan")} />
      <SmallButton icon={List} label="List" pressed={p.view === "list"} onClick={() => p.onView("list")} />
    </Stack>
  );
  const zoom = (
    <Stack>
      <SmallButton icon={ZoomIn} label="Zoom in" onClick={p.onZoomIn} disabled={notPlan} />
      <SmallButton icon={ZoomOut} label="Zoom out" onClick={p.onZoomOut} disabled={notPlan} />
      <SmallButton icon={Search} label={`${Math.round(p.zoom * 100)}%`} ariaLabel="Reset zoom to 100%" onClick={p.onZoomReset} disabled={notPlan || p.zoom === 1} />
    </Stack>
  );
  const workspace = (
    <Stack>
      <SmallButton icon={p.locked ? Lock : LockOpen} label={p.locked ? "Unlock layout" : "Lock layout"} pressed={p.locked} onClick={() => p.onLocked(!p.locked)} />
      <SmallButton icon={p.expanded ? Shrink : Expand} label={p.expanded ? "Exit focus" : "Focus view"} pressed={p.expanded} onClick={() => p.onExpanded(!p.expanded)} />
    </Stack>
  );
  const print = (
    <Stack>
      <SmallButton icon={LayoutGrid} label="Floor plan" ariaLabel="Print floor plan" onClick={() => p.onPrint({ view: "plan", names })} disabled={nothing} />
      <SmallButton icon={List} label="Table list" ariaLabel="Print table list" onClick={() => p.onPrint({ view: "tables", names })} disabled={nothing} />
      <SmallButton icon={ListOrdered} label="Guest lookup" ariaLabel="Print guest lookup" onClick={() => p.onPrint({ view: "lookup", names })} disabled={nothing} />
    </Stack>
  );
  const data = (
    <Stack>
      <SmallButton icon={Download} label="CSV file" ariaLabel="Download seating CSV" onClick={p.onExportCsv} disabled={nothing} />
      <label className="inline-flex h-[23px] cursor-pointer items-center gap-1.5 px-1.5 text-xs" style={{ color: "var(--color-on-surface)" }}>
        <input type="checkbox" checked={names} onChange={(e) => setNames(e.target.checked)} className="accent-[var(--color-primary)]" />
        Include names
      </label>
    </Stack>
  );

  return (
    <div
      className="shrink-0 overflow-hidden"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline)", borderRadius: "var(--radius-md)" }}
    >
      {/* Quick access, tabs, collapse */}
      <div
        className="flex items-center gap-2 px-2 transition-[border-color] duration-200"
        style={{ background: "var(--color-surface-container-low)", borderBottom: `1px solid ${collapsed ? "transparent" : "var(--color-outline)"}` }}
      >
        <div role="group" aria-label="Quick access" className="flex items-center gap-0.5 py-1">
          <QuickButton icon={Undo2} title={`Undo (${mod}Z)`} label="Undo" onClick={p.onUndo} disabled={!p.canUndo} />
          <QuickButton icon={Redo2} title={`Redo (${mod}Shift+Z)`} label="Redo" onClick={p.onRedo} disabled={!p.canRedo} />
          <QuickButton icon={Printer} title="Print floor plan" label="Print floor plan" onClick={() => p.onPrint({ view: "plan", names })} disabled={nothing} />
          <QuickButton icon={Download} title="Export CSV" label="Export seating chart as CSV" onClick={p.onExportCsv} disabled={nothing} />
        </div>
        <span aria-hidden className="h-5 w-px" style={{ background: "var(--color-outline)" }} />
        <div role="tablist" aria-label="Toolbar" className="flex min-w-0 flex-1">
          {tabs.map(([id, label]) => {
            const on = active === id && !collapsed;
            const contextual = id === "context";
            return (
              <button
                key={id}
                id={`${baseId}-tab-${id}`}
                role="tab"
                type="button"
                aria-selected={active === id}
                aria-controls={`${baseId}-panel`}
                tabIndex={active === id ? 0 : -1}
                onClick={() => pick(id)}
                onKeyDown={onTabKey}
                className={`relative min-h-[36px] shrink-0 whitespace-nowrap px-3.5 ${contextual ? "fade-in" : ""} text-[0.8125rem] transition-colors hover:text-[var(--color-on-surface)]`}
                style={{
                  color: on || contextual ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)",
                  fontWeight: on ? 600 : contextual ? 500 : 400,
                  background: contextual ? "var(--color-primary-container)" : undefined,
                }}
              >
                {label}
                <span
                  aria-hidden
                  className="absolute inset-x-2 bottom-0 h-[2px] transition-opacity duration-150"
                  style={{ background: "var(--color-primary)", borderRadius: 2, opacity: on ? 1 : 0 }}
                />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => toggleCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-controls={`${baseId}-panel`}
          aria-label={collapsed ? "Expand toolbar" : "Collapse toolbar"}
          title={collapsed ? "Expand toolbar" : "Collapse toolbar"}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center transition-colors hover:bg-[var(--color-surface-container-high)]"
          style={{ borderRadius: "var(--radius-sm)", color: "var(--color-on-surface-variant)" }}
        >
          <ChevronUp size={16} className="transition-transform duration-200 ease-out" style={{ transform: collapsed ? "rotate(180deg)" : "none" }} />
        </button>
      </div>

      {/* Kept mounted so collapsing can animate its height; inert while closed. */}
      <div className="accordion-body" data-open={!collapsed} inert={collapsed}>
        <div className="min-h-0 overflow-hidden">
        <div
          key={active}
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
          className="ribbon-swap flex items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {active === "context" && p.context ? (
            <>
              {p.context.content}
              <FillStrip />
            </>
          ) : active === "plan" ? (
            <>
              {tables}
              {room}
              <Group label="View">
                <LargeButton icon={LayoutGrid} label="Floor plan" pressed={p.view === "plan"} onClick={() => p.onView("plan")} />
                <LargeButton icon={List} label="List" pressed={p.view === "list"} onClick={() => p.onView("list")} />
                {zoom}
                {workspace}
              </Group>
              <Group label="Print or export">
                {print}
                {data}
              </Group>
              <FillStrip />
            </>
          ) : active === "home" ? (
            <>
              {tables}
              {room}
              <FillStrip />
            </>
          ) : active === "view" ? (
            <>
              <Group label="Show">{show}</Group>
              <Group label="Zoom">{zoom}</Group>
              <Group label="Workspace">{workspace}</Group>
              <FillStrip />
            </>
          ) : (
            <>
              <Group label="Print or save as PDF">{print}</Group>
              <Group label="Data">{data}</Group>
              <FillStrip />
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

/** Carries the neutral group-name strip to the ribbon's right edge. */
function FillStrip() {
  return (
    <div aria-hidden className="flex min-w-0 flex-1 flex-col">
      <div className="flex-1" />
      <span className="block py-[3px] text-[0.6875rem]" style={{ background: "#F3F3F2", borderTop: "1px solid #E7E6E4" }}>&nbsp;</span>
    </div>
  );
}

function AddSeveral({ disabled, room, onAdd }: { disabled: boolean; room: number; onAdd: Props["onAddTables"] }) {
  const [count, setCount] = useState(5);
  const [shape, setShape] = useState<SeatingTable["shape"]>("round");
  const [seats, setSeats] = useState(DEFAULT_SEATS.round);
  const n = Math.min(count, room);
  const shapes = [
    ["round", "Round", <Circle key="i" size={15} aria-hidden />],
    ["rect", "Long", <RectangleHorizontal key="i" size={15} aria-hidden />],
    ["arc", "Half-moon", <HalfMoonIcon key="i" size={15} />],
    ["curve", "S-curve", <Spline key="i" size={15} aria-hidden />],
  ] as const;
  return (
    <MenuButton icon={Plus} label="Several" disabled={disabled}>
      {(close) => (
        <div className="w-72 space-y-4">
          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Add several tables</p>
          <div className="grid grid-cols-4 gap-1" role="group" aria-label="Shape">
            {shapes.map(([s, text, icon]) => (
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
            fullWidth
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
      {(close) => (
        <div className="w-[19rem] space-y-3">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Add to the room</p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>Drag it into place, then resize from the corner.</p>
          </div>
          <ul className="grid grid-cols-2 gap-1">
            {[...ELEMENT_PRESETS, CUSTOM_PRESETS.rect].map((item, i) => {
              const Icon = ELEMENT_ICON[item.kind];
              return (
                <li key={`${item.kind}-${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(item);
                      close();
                    }}
                    className="flex min-h-[40px] w-full items-center gap-2.5 px-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-container-low)]"
                    style={{ borderRadius: "var(--radius-sm)", color: "var(--color-on-surface)" }}
                  >
                    <Icon size={15} aria-hidden style={{ color: "var(--color-on-surface-variant)" }} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </MenuButton>
  );
}
