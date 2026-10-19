"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Popover from "@/components/ui/Popover";
import { cn } from "@/lib/utils";

interface Props {
  /** ISO date (YYYY-MM-DD) or "" for none. */
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  "aria-label"?: string;
  /** Adds a hidden input so the value is sent with a surrounding form. */
  name?: string;
  placeholder?: string;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = Array.from({ length: 12 }, (_, m) => new Date(2000, m, 1).toLocaleDateString("en-US", { month: "short" }));

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

function parse(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  return m >= 0 && m < 12 && d >= 1 && d <= daysIn(y, m) ? { y, m, d } : null;
}

const fromDate = (date: Date) => toIso(date.getFullYear(), date.getMonth(), date.getDate());
const todayIso = () => fromDate(new Date());

function addDays(iso: string, n: number) {
  const { y, m, d } = parse(iso)!;
  return fromDate(new Date(y, m, d + n));
}

function addMonths(iso: string, n: number) {
  const { y, m, d } = parse(iso)!;
  const total = y * 12 + m + n;
  const [ny, nm] = [Math.floor(total / 12), ((total % 12) + 12) % 12];
  return toIso(ny, nm, Math.min(d, daysIn(ny, nm)));
}

function format(iso: string, options: Intl.DateTimeFormatOptions) {
  const p = parse(iso);
  return p ? new Date(p.y, p.m, p.d).toLocaleDateString("en-US", options) : "";
}

const FIELD_CLASS = cn(
  "flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-3 border-0 border-b bg-transparent py-2.5 text-left text-sm outline-none transition-colors duration-150",
  // `!` beats the global `* { border-color: transparent }` reset.
  "border-[var(--color-outline)]! hover:border-[var(--color-on-surface-muted)]!",
  "focus-visible:border-[var(--color-primary)]! aria-expanded:border-[var(--color-primary)]!"
);

const ICON_BUTTON =
  "flex h-9 w-9 items-center justify-center transition-colors duration-150 hover:bg-[var(--color-surface-container)]";

/**
 * A themed date picker. The trigger reads like an InputField; the calendar is
 * a popover dialog with a keyboard-navigable grid (arrows, Home/End,
 * Page Up/Down for months, Shift+Page Up/Down for years).
 */
export default function DateField({ value, onChange, id, label, "aria-label": ariaLabel, name, placeholder = "Choose a date" }: Props) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const labelId = `${baseId}-label`;
  const valueId = `${baseId}-value`;
  const dialogId = `${baseId}-calendar`;
  const headingId = `${baseId}-heading`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusCursor = useRef(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"days" | "months">("days");
  const [cursor, setCursor] = useState("");
  const [today, setToday] = useState("");

  const selected = parse(value) ? value : "";

  const show = () => {
    const now = todayIso();
    setToday(now);
    setCursor(selected || now);
    setView("days");
    setOpen(true);
    focusCursor.current = true;
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const pick = (iso: string) => {
    if (iso !== value) onChange(iso);
    close();
  };

  // Move focus to the cursor day when the calendar opens or keyboard moves it.
  useEffect(() => {
    if (!open || !focusCursor.current) return;
    focusCursor.current = false;
    const selector = view === "days" ? `[data-date="${cursor}"]` : `[data-month="${parse(cursor)?.m}"]`;
    panelRef.current?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
  }, [open, view, cursor]);

  const moveCursor = (next: string) => {
    focusCursor.current = true;
    setCursor(next);
  };

  const onGridKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const weekday = new Date(`${cursor}T00:00:00`).getDay();
    const step: Record<string, number | undefined> = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -weekday, End: 6 - weekday,
    };
    if (step[e.key] !== undefined) {
      e.preventDefault();
      moveCursor(addDays(cursor, step[e.key]!));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      moveCursor(addMonths(cursor, (e.key === "PageUp" ? -1 : 1) * (e.shiftKey ? 12 : 1)));
    }
  };

  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (view === "months") {
        focusCursor.current = true;
        setView("days");
      } else close();
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog while it's open.
      const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>("button:not([tabindex='-1']):not(:disabled)") ?? [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const display = selected ? format(selected, { weekday: "short", month: "long", day: "numeric", year: "numeric" }) : "";
  const c = parse(cursor);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span id={labelId} className="text-[0.8125rem] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
          {label}
        </span>
      )}
      <button
        ref={triggerRef}
        id={baseId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-labelledby={label ? `${labelId} ${valueId}` : undefined}
        aria-label={label ? undefined : `${ariaLabel ?? "Date"}, ${display || "not set"}`}
        onClick={() => (open ? close(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            show();
          }
        }}
        className={FIELD_CLASS}
      >
        <span
          id={valueId}
          className="min-w-0 truncate"
          style={{ color: display ? "var(--color-on-surface)" : "var(--color-on-surface-muted)" }}
        >
          {display || placeholder}
        </span>
        <CalendarDays size={16} aria-hidden className="shrink-0" style={{ color: "var(--color-on-surface-variant)" }} />
      </button>
      {name && <input type="hidden" name={name} value={selected} />}

      {open && c && (
        <Popover
          anchorRef={triggerRef}
          onDismiss={() => close(false)}
          id={dialogId}
          role="dialog"
          aria-modal="false"
          aria-label={label ? `Choose ${label.toLowerCase()}` : "Choose a date"}
          onKeyDown={onPanelKeyDown}
          className="w-[19.5rem] p-3"
        >
          <div ref={panelRef}>
            {/* Header: month (or year) with previous / next */}
            <div className="flex items-center justify-between gap-2 pb-2">
              <button
                type="button"
                onClick={() => setView((v) => (v === "days" ? "months" : "days"))}
                aria-label={view === "days" ? "Choose month and year" : "Back to days"}
                className="inline-flex min-h-[36px] items-center gap-1.5 px-2.5 transition-colors duration-150 hover:bg-[var(--color-surface-container)]"
                style={{ borderRadius: "var(--radius-full)" }}
              >
                <span
                  id={headingId}
                  aria-live="polite"
                  className="text-base"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--color-on-surface)" }}
                >
                  {view === "days" ? format(cursor, { month: "long", year: "numeric" }) : c.y}
                </span>
                <ChevronDown
                  size={14}
                  aria-hidden
                  className="transition-transform duration-200 ease-out"
                  style={{ color: "var(--color-on-surface-variant)", transform: view === "months" ? "rotate(180deg)" : undefined }}
                />
              </button>
              <div className="flex items-center">
                {([-1, 1] as const).map((dir) => {
                  const unit = view === "days" ? "month" : "year";
                  return (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setCursor(addMonths(cursor, dir * (view === "days" ? 1 : 12)))}
                      aria-label={`${dir < 0 ? "Previous" : "Next"} ${unit}`}
                      title={`${dir < 0 ? "Previous" : "Next"} ${unit}`}
                      className={ICON_BUTTON}
                      style={{ borderRadius: "var(--radius-full)", color: "var(--color-on-surface-variant)" }}
                    >
                      {dir < 0 ? <ChevronLeft size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
                    </button>
                  );
                })}
              </div>
            </div>

            {view === "days" ? (
              <DayGrid
                cursor={cursor}
                selected={selected}
                today={today}
                headingId={headingId}
                onPick={pick}
                onKeyDown={onGridKeyDown}
              />
            ) : (
              <div className="grid grid-cols-3 gap-1.5 py-1" role="group" aria-labelledby={headingId}>
                {MONTHS.map((month, m) => {
                  const p = parse(selected);
                  const isSelected = p?.y === c.y && p.m === m;
                  return (
                    <button
                      key={month}
                      type="button"
                      data-month={m}
                      aria-pressed={isSelected}
                      onClick={() => {
                        focusCursor.current = true;
                        setCursor(toIso(c.y, m, Math.min(c.d, daysIn(c.y, m))));
                        setView("days");
                      }}
                      className="min-h-[44px] text-sm transition-colors duration-150 hover:bg-[var(--color-surface-container)]"
                      style={{
                        borderRadius: "var(--radius-full)",
                        background: isSelected ? "var(--color-primary)" : m === c.m ? "var(--color-surface-container)" : undefined,
                        color: isSelected ? "#fff" : "var(--color-on-surface)",
                        fontWeight: isSelected || m === c.m ? 500 : 400,
                      }}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--color-outline)" }}>
              <button
                type="button"
                onClick={() => pick("")}
                disabled={!selected}
                className="min-h-[36px] px-3 text-sm transition-colors duration-150 hover:bg-[var(--color-surface-container)] disabled:invisible"
                style={{ borderRadius: "var(--radius-full)", color: "var(--color-on-surface-variant)" }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => pick(today)}
                className="min-h-[36px] px-3 text-sm font-medium transition-colors duration-150 hover:bg-[var(--color-surface-container)]"
                style={{ borderRadius: "var(--radius-full)", color: "var(--color-primary)" }}
              >
                Today
              </button>
            </div>
          </div>
        </Popover>
      )}
    </div>
  );
}

interface DayGridProps {
  cursor: string;
  selected: string;
  today: string;
  headingId: string;
  onPick: (iso: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTableElement>) => void;
}

function DayGrid({ cursor, selected, today, headingId, onPick, onKeyDown }: DayGridProps) {
  const { y, m } = parse(cursor)!;
  const lead = new Date(y, m, 1).getDay();
  const count = daysIn(y, m);
  // Always six weeks, so the popover keeps its height from month to month.
  const weeks = Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const day = w * 7 + d - lead + 1;
      return day >= 1 && day <= count ? day : null;
    })
  );

  return (
    <table role="grid" aria-labelledby={headingId} onKeyDown={onKeyDown} className="w-full border-collapse">
      <thead>
        <tr>
          {WEEKDAYS.map((day) => (
            <th
              key={day}
              scope="col"
              abbr={day}
              className="h-8 text-xs font-medium"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              {day.slice(0, 2)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, w) => (
          <tr key={w}>
            {week.map((day, d) => {
              if (!day) return <td key={d} className="h-10" />;
              const iso = toIso(y, m, day);
              const isSelected = iso === selected;
              const isToday = iso === today;
              return (
                <td key={d} className="h-10 p-0 text-center" aria-selected={isSelected}>
                  <button
                    type="button"
                    data-date={iso}
                    tabIndex={iso === cursor ? 0 : -1}
                    aria-label={format(iso, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    aria-current={isToday ? "date" : undefined}
                    onClick={() => onPick(iso)}
                    className={cn(
                      "mx-auto flex h-9 w-9 items-center justify-center text-sm tabular-nums transition-colors duration-150",
                      !isSelected && "hover:bg-[var(--color-surface-container)]"
                    )}
                    style={{
                      borderRadius: "var(--radius-full)",
                      background: isSelected ? "var(--color-primary)" : undefined,
                      color: isSelected ? "#fff" : isToday ? "var(--color-primary)" : "var(--color-on-surface)",
                      fontWeight: isSelected || isToday ? 600 : 400,
                      boxShadow: isToday && !isSelected ? "inset 0 0 0 1px var(--color-primary)" : undefined,
                    }}
                  >
                    {day}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
