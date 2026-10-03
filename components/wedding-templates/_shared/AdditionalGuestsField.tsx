"use client";

import { useId, type CSSProperties } from "react";
import { Plus, X } from "lucide-react";

interface Props {
  /** Most additional guests this invitee may name. */
  max: number;
  names: string[];
  onChange: (names: string[]) => void;
  /** Label and helper text colour. */
  labelColor: string;
  /** Typed text colour. */
  textColor: string;
  /** Underline colour of each name field. */
  lineColor: string;
  /** Colour of the "Add a guest" action. */
  accent: string;
  /** Optional overrides for templates with their own type scale. */
  labelStyle?: CSSProperties;
  fieldStyle?: CSSProperties;
  actionStyle?: CSSProperties;
}

/**
 * Name field list for invitees who may bring more than one extra guest.
 * Template RSVP forms render this in place of their single plus-one control
 * when `useRsvpSubmit().maxPlusOnes > 1`. Blank rows are ignored on submit.
 */
export default function AdditionalGuestsField({
  max,
  names,
  onChange,
  labelColor,
  textColor,
  lineColor,
  accent,
  labelStyle,
  fieldStyle,
  actionStyle,
}: Props) {
  const baseId = useId();
  const setName = (index: number, value: string) =>
    onChange(names.map((n, i) => (i === index ? value : n)));

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="label-luxury mb-1" style={{ color: labelColor, ...labelStyle }}>
        Additional guests (up to {max})
      </legend>

      {names.map((name, i) => (
        <div key={i} className="flex items-center gap-2">
          <label htmlFor={`${baseId}-${i}`} className="sr-only">
            Additional guest {i + 1} full name
          </label>
          <input
            id={`${baseId}-${i}`}
            value={name}
            maxLength={80}
            placeholder="Guest's full name"
            autoComplete="off"
            onChange={(e) => setName(i, e.target.value)}
            className="min-h-[44px] min-w-0 flex-1 border-0 border-b bg-transparent px-0 py-2 text-sm font-light"
            style={{ borderBottomColor: lineColor, color: textColor, ...fieldStyle }}
          />
          <button
            type="button"
            onClick={() => onChange(names.filter((_, idx) => idx !== i))}
            aria-label={`Remove additional guest ${i + 1}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity hover:opacity-60"
            style={{ color: labelColor }}
          >
            <X size={15} />
          </button>
        </div>
      ))}

      {names.length < max && (
        <button
          type="button"
          onClick={() => onChange([...names, ""])}
          className="flex min-h-[44px] items-center gap-2 self-start text-sm transition-opacity hover:opacity-70"
          style={{ color: accent, ...actionStyle }}
        >
          <Plus size={14} aria-hidden />
          {names.length === 0 ? "Add a guest" : "Add another guest"}
        </button>
      )}
    </fieldset>
  );
}
