"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import Popover from "@/components/ui/Popover";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  /** Options sharing a group are listed under that heading. */
  group?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  /** Visible label above the field. Use `aria-label` when there's none. */
  label?: string;
  "aria-label"?: string;
  /** "field" matches InputField; "chip" is a compact pill for toolbars. */
  variant?: "field" | "chip";
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

const VARIANT_CLASS = {
  field: cn(
    "flex min-h-[44px] w-full items-center justify-between gap-3 border-0 border-b bg-transparent py-2.5 text-left text-sm",
    // `!` beats the global `* { border-color: transparent }` reset.
    "border-[var(--color-outline)]! hover:border-[var(--color-on-surface-muted)]!",
    "focus-visible:border-[var(--color-primary)]! aria-expanded:border-[var(--color-primary)]!"
  ),
  chip: cn(
    "inline-flex min-h-[36px] max-w-full items-center gap-2 rounded-full border bg-[var(--color-surface-container-lowest)] pl-3.5 pr-2.5 text-left text-sm",
    "border-[var(--color-outline)]! hover:bg-[var(--color-surface-container-low)] aria-expanded:border-[var(--color-on-surface-variant)]!"
  ),
};

/**
 * A themed replacement for <select>. Follows the ARIA select-only combobox
 * pattern: focus stays on the trigger, arrow keys move through the options,
 * Enter or Space picks one, Escape closes, and typing jumps to a match.
 */
export default function Select({
  value, onChange, options, id, label, "aria-label": ariaLabel, variant = "field", className, style, disabled,
}: Props) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const labelId = `${baseId}-label`;
  const listId = `${baseId}-listbox`;
  const optionId = (i: number) => `${baseId}-option-${i}`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ text: "", time: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];
  const last = options.length - 1;

  const show = (index = selectedIndex) => {
    setActive(Math.max(0, index));
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    const list = document.getElementById(listId);
    const item = document.getElementById(optionId(active));
    if (!list || !item) return;
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop - 4;
    else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight + 4;
    }
    // optionId only depends on baseId, which listId already covers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active, listId]);

  const findMatch = (key: string) => {
    const now = Date.now();
    const t = typeahead.current;
    t.text = now - t.time > 700 ? key : t.text + key;
    t.time = now;
    const query = t.text.toLowerCase();
    const from = (open ? active : selectedIndex) + (t.text.length === 1 ? 1 : 0);
    for (let k = 0; k < options.length; k++) {
      const i = (Math.max(0, from) + k) % options.length;
      if (options[i].label.toLowerCase().startsWith(query)) return i;
    }
    return -1;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const typed = e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      } else if (typed) {
        const match = findMatch(e.key);
        if (match >= 0) show(match);
      }
      return;
    }
    const move = (index: number) => {
      e.preventDefault();
      setActive(Math.max(0, Math.min(last, index)));
    };
    switch (e.key) {
      case "ArrowDown": return move(active + 1);
      case "ArrowUp": return move(active - 1);
      case "PageDown": return move(active + 8);
      case "PageUp": return move(active - 8);
      case "Home": return move(0);
      case "End": return move(last);
      case "Enter":
      case " ":
        e.preventDefault();
        return choose(active);
      case "Escape":
        e.preventDefault();
        return setOpen(false);
      case "Tab":
        return setOpen(false);
      default:
        if (typed) {
          const match = findMatch(e.key);
          if (match >= 0) setActive(match);
        }
    }
  };

  // Consecutive options with the same `group` render under one heading.
  const sections: { group?: string; items: { option: SelectOption; index: number }[] }[] = [];
  options.forEach((option, index) => {
    const prev = sections[sections.length - 1];
    if (prev && prev.group === option.group) prev.items.push({ option, index });
    else sections.push({ group: option.group, items: [{ option, index }] });
  });

  return (
    <div className={variant === "field" ? "flex flex-col gap-1.5" : "inline-flex min-w-0 max-w-full"}>
      {label && (
        <span id={labelId} className="text-[0.8125rem] font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
          {label}
        </span>
      )}
      <button
        ref={triggerRef}
        id={baseId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
        className={cn(
          VARIANT_CLASS[variant],
          "cursor-pointer outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{ color: "var(--color-on-surface)", ...style }}
      >
        <span className="min-w-0 truncate">{selected?.label ?? "Choose…"}</span>
        <ChevronDown
          size={variant === "chip" ? 14 : 16}
          aria-hidden
          className="shrink-0 transition-transform duration-200 ease-out"
          style={{ transform: open ? "rotate(180deg)" : undefined, opacity: 0.7 }}
        />
      </button>

      {open && (
        <Popover
          anchorRef={triggerRef}
          onDismiss={() => setOpen(false)}
          matchWidth
          id={listId}
          role="listbox"
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : ariaLabel}
          tabIndex={-1}
          // Keep focus on the trigger so the keyboard model above keeps working.
          onMouseDown={(e) => e.preventDefault()}
          className="p-1"
        >
          {sections.map(({ group, items }, s) => {
            const headingId = `${baseId}-group-${s}`;
            const list = items.map(({ option, index }) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${option.value}-${index}`}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onPointerMove={() => setActive(index)}
                  onClick={() => choose(index)}
                  className="flex min-h-[40px] cursor-pointer items-center gap-2.5 py-2 pl-2.5 pr-4 text-sm"
                  style={{
                    borderRadius: "var(--radius-sm)",
                    background: index === active ? "var(--color-surface-container)" : undefined,
                    fontWeight: isSelected ? 500 : 400,
                  }}
                >
                  <Check
                    size={14}
                    strokeWidth={2.5}
                    aria-hidden
                    className="shrink-0"
                    style={{ color: "var(--color-primary)", visibility: isSelected ? "visible" : "hidden" }}
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                </div>
              );
            });
            if (!group) return <div key={s}>{list}</div>;
            return (
              <div key={s} role="group" aria-labelledby={headingId} className={s > 0 ? "mt-1 pt-1" : undefined} style={s > 0 ? { borderTop: "1px solid var(--color-outline)" } : undefined}>
                <div
                  id={headingId}
                  role="presentation"
                  className="px-2.5 pb-1 pt-2 text-xs font-medium"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {group}
                </div>
                {list}
              </div>
            );
          })}
        </Popover>
      )}
    </div>
  );
}
