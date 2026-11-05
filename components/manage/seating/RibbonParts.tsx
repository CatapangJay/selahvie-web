"use client";

import { isValidElement, useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import Popover from "@/components/ui/Popover";

/**
 * Office-style ribbon building blocks. A group is a run of commands with its
 * name on a neutral strip underneath; large buttons carry the main action,
 * small stacked ones its siblings.
 */

/** Neutral (unbranded) grey for the group-name strip, so the commands above read as one surface. */
const STRIP = { background: "#F3F3F2", color: "#5B5B59", borderTop: "1px solid #E7E6E4" } as const;

export function Group({ label, last, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 flex-col" style={{ borderRight: last ? "none" : "1px solid #E7E6E4" }}>
      <div className="flex h-[84px] items-start gap-1 px-2 py-1.5">{children}</div>
      <span aria-hidden className="block truncate px-2 py-[3px] text-center text-[0.6875rem]" style={STRIP}>
        {label}
      </span>
    </div>
  );
}

export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-px pt-0.5">{children}</div>;
}

/** A labelled control on one small-button line: "Seats  [-] 8 [+]". */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex h-[23px] items-center gap-2 px-1.5 text-xs" style={{ color: "var(--color-on-surface)" }}>
      <span className="w-[3.25rem] shrink-0" style={{ color: "var(--color-on-surface-variant)" }}>{label}</span>
      {children}
    </div>
  );
}

export const renderIcon = (icon: LucideIcon | ReactNode, size: number) => {
  if (isValidElement(icon)) return icon;
  const Icon = icon as LucideIcon;
  return <Icon size={size} aria-hidden />;
};

const BUTTON_BASE =
  "transition-colors duration-150 hover:bg-[var(--color-surface-container-low)] active:bg-[var(--color-surface-container)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";
const LARGE = `flex h-[72px] min-w-[4rem] max-w-[5.5rem] shrink-0 flex-col items-center justify-start gap-1 px-1 pt-2 text-xs leading-tight ${BUTTON_BASE}`;

export function LargeButton({ icon, label, ariaLabel, title, pressed, disabled, onClick }: {
  icon: LucideIcon | ReactNode;
  label: string;
  ariaLabel?: string;
  title?: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      title={title}
      className={LARGE}
      style={{
        borderRadius: "var(--radius-sm)",
        color: pressed ? "var(--color-primary-dim)" : "var(--color-on-surface)",
        background: pressed ? "var(--color-primary-container-strong)" : undefined,
      }}
    >
      <span style={{ color: pressed ? "var(--color-primary-dim)" : "var(--color-on-surface-variant)" }}>{renderIcon(icon, 22)}</span>
      <span className="line-clamp-2 text-center">{label}</span>
    </button>
  );
}

export function SmallButton({ icon, label, ariaLabel, pressed, disabled, tone, onClick }: {
  icon: LucideIcon | ReactNode;
  label: string;
  ariaLabel?: string;
  pressed?: boolean;
  disabled?: boolean;
  tone?: "danger";
  onClick: () => void;
}) {
  const color = tone === "danger" ? "var(--color-error)" : pressed ? "var(--color-primary-dim)" : "var(--color-on-surface)";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      className={`inline-flex h-[23px] items-center gap-1.5 whitespace-nowrap px-1.5 text-xs ${BUTTON_BASE}`}
      style={{
        borderRadius: "calc(var(--radius-sm) - 2px)",
        color,
        background: pressed ? "var(--color-primary-container-strong)" : undefined,
        fontWeight: pressed ? 500 : 400,
      }}
    >
      <span className="inline-flex w-[15px] justify-center" style={{ color: tone === "danger" || pressed ? color : "var(--color-on-surface-variant)" }}>
        {renderIcon(icon, 15)}
      </span>
      {label}
    </button>
  );
}

export function QuickButton({ icon: Icon, label, title, disabled, onClick }: { icon: LucideIcon; label: string; title: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center transition-colors duration-150 hover:bg-[var(--color-surface-container-high)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      style={{ borderRadius: "var(--radius-sm)", color: "var(--color-on-surface-variant)" }}
    >
      <Icon size={15} />
    </button>
  );
}

/** A compact ribbon text field. */
export function RibbonInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-[26px] w-full px-2 text-xs outline-none transition-colors placeholder:text-[var(--color-on-surface-variant)] focus:border-[var(--color-primary)]!"
      style={{
        color: "var(--color-on-surface)",
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline)",
        borderRadius: "calc(var(--radius-sm) - 2px)",
      }}
    />
  );
}

/** A large ribbon button that opens a panel. Escape or a press outside closes it. */
export function MenuButton({ icon, label, disabled, children }: { icon: LucideIcon | ReactNode; label: string; disabled?: boolean; children: (close: () => void) => ReactNode }) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const anchorRef = useMemo(() => ({ current: anchor }), [anchor]);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    anchor?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
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
        className={LARGE}
        style={{ borderRadius: "var(--radius-sm)", color: "var(--color-on-surface)", background: open ? "var(--color-surface-container)" : undefined }}
      >
        <span style={{ color: "var(--color-on-surface-variant)" }}>{renderIcon(icon, 22)}</span>
        <span className="inline-flex items-center gap-0.5">
          {label}
          <ChevronDown size={11} aria-hidden />
        </span>
      </button>
      {open && (
        <Popover anchorRef={anchorRef} onDismiss={() => setOpen(false)} role="dialog" aria-label={label} className="p-4">
          {children(close)}
        </Popover>
      )}
    </>
  );
}
