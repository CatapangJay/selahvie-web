"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";

type Reply = "accept" | "decline" | null;

// The demo wedding's tally before this visitor replies.
// Accepting lands on 87 / 12 / 21, the same numbers the guest-list preview shows.
const BASE = { attending: 86, declined: 12, awaiting: 22 };

const INK = "var(--color-on-surface)";
const INK_VARIANT = "var(--color-on-surface-variant)";

/**
 * A working miniature of the product: an RSVP card the visitor can actually
 * answer. Their reply moves the couple's tally underneath, which is the whole
 * pitch (guests reply, the list counts itself) in one gesture.
 */
export default function HeroRsvpCard() {
  const [reply, setReply] = useState<Reply>(null);
  const name = useId();

  const tally = {
    attending: BASE.attending + (reply === "accept" ? 1 : 0),
    declined: BASE.declined + (reply === "decline" ? 1 : 0),
    awaiting: BASE.awaiting - (reply ? 1 : 0),
  };
  const total = BASE.attending + BASE.declined + BASE.awaiting;

  const options: { value: Exclude<Reply, null>; label: string }[] = [
    { value: "accept", label: "Joyfully accepts" },
    { value: "decline", label: "Regretfully declines" },
  ];

  return (
    <div
      className="bmg-card w-full max-w-[22rem]"
      style={{
        background: "#FFFDFC",
        color: INK,
        borderRadius: "6px",
        boxShadow: "0 30px 60px -20px rgba(30, 8, 14, 0.55), 0 8px 18px rgba(30, 8, 14, 0.18)",
      }}
    >
      <fieldset className="px-6 pb-5 pt-6">
        <legend className="sr-only">Try it: reply to Bea and Luis&rsquo;s invitation</legend>
        <p aria-hidden className="text-center" style={{ fontFamily: "var(--font-display)", fontSize: "1.55rem", lineHeight: 1.1 }}>
          Kindly reply
        </p>
        <p aria-hidden className="mt-1 text-center text-xs" style={{ color: INK_VARIANT }}>
          to Bea &amp; Luis by the first of May
        </p>

        <div aria-hidden className="mt-5 flex items-end gap-2">
          <span className="text-xs" style={{ color: INK_VARIANT }}>M</span>
          <span
            className="flex-1 pb-0.5 text-center"
            style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", borderBottom: "1px solid var(--color-outline)" }}
          >
            You
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          {options.map((o) => {
            const on = reply === o.value;
            return (
              <label
                key={o.value}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[4px] px-2 text-sm transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)]"
                style={{ background: on ? "var(--color-primary-container)" : undefined }}
              >
                <input
                  type="radio"
                  name={name}
                  value={o.value}
                  checked={on}
                  onChange={() => setReply(o.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] transition-colors duration-200"
                  style={{
                    border: `1.5px solid ${on ? "var(--color-primary)" : "var(--color-on-surface-variant)"}`,
                    background: on ? "var(--color-primary)" : "transparent",
                  }}
                >
                  {on && <Check size={13} strokeWidth={2.5} color="#fff" />}
                </span>
                <span style={{ color: on ? "var(--color-primary-dim)" : INK, fontWeight: on ? 600 : 400 }}>{o.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* The couple's side of the same reply */}
      <div
        className="px-6 pb-5 pt-4"
        style={{ borderTop: "1px dashed var(--color-outline)", background: "var(--color-surface-container-low)", borderRadius: "0 0 6px 6px" }}
      >
        <div className="flex items-baseline justify-between text-xs" style={{ color: INK_VARIANT }}>
          <span>Bea &amp; Luis&rsquo;s guest list</span>
          <span>{total} invited</span>
        </div>
        <div aria-hidden className="mt-2.5 flex h-1.5 overflow-hidden rounded-full" style={{ background: "var(--color-outline)" }}>
          <span className="transition-[flex-grow] duration-500" style={{ flexGrow: tally.attending, background: "var(--color-success)" }} />
          <span className="transition-[flex-grow] duration-500" style={{ flexGrow: tally.declined, background: "var(--color-primary)" }} />
          <span className="transition-[flex-grow] duration-500" style={{ flexGrow: tally.awaiting }} />
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-xs" style={{ color: INK_VARIANT }}>
          {([
            ["Attending", tally.attending, "accept"],
            ["Declined", tally.declined, "decline"],
            ["Awaiting", tally.awaiting, null],
          ] as const).map(([label, n, key]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd className="mt-0.5 overflow-hidden" style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", lineHeight: 1.1, color: INK }}>
                {/* Re-keyed on change so the new number ticks in. */}
                <span key={`${n}`} className={reply && (key === reply || key === null) ? "bmg-tick" : undefined}>
                  {n}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p role="status" className="mt-3 min-h-[1.25rem] text-xs" style={{ color: INK_VARIANT }}>
          {reply === "accept" && "Counted. One more seat at the table."}
          {reply === "decline" && "Counted. No chasing needed."}
          {!reply && "Choose one, and watch the list update."}
        </p>
      </div>
    </div>
  );
}
