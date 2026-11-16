"use client";

import { useSyncExternalStore } from "react";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, ENGRAVED } from "../theme";

const subscribe = (onTick: () => void) => {
  // Minutes are the finest unit shown; a slow tick keeps the panel still.
  const id = setInterval(onTick, 15_000);
  return () => clearInterval(id);
};
/** Rounded to the minute, so the snapshot only changes when the readout does. */
const nowSeconds = () => Math.floor(Date.now() / 60_000) * 60;
// The server renders dashes so hydration never disagrees with the clock.
const serverSeconds = () => null;
const DAY = 86_400;

/**
 * The floor indicator over the lift doors, set into the hero: a dark bronze-ruled
 * panel with "Arriving in" and three equal readouts for days, hours and minutes.
 */
export default function CountdownStrip({ date, palette: p }: { date: DateParts; palette: Palette }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const target = date.date;
  if (!target) return null;
  const left = now === null ? null : Math.floor(target.getTime() / 1000) - now;
  const soft = `color-mix(in srgb, ${p.linenOn} 76%, transparent)`;
  const rule = `1px solid color-mix(in srgb, ${p.bronzeLight} 40%, transparent)`;
  const panel = { background: p.oxbloodDeep, color: p.linenOn, border: `1px solid color-mix(in srgb, ${p.bronzeLight} 55%, transparent)`, outline: `1px solid color-mix(in srgb, ${p.bronzeLight} 22%, transparent)`, outlineOffset: 3 };

  if (left !== null && left <= 0) {
    return (
      <p className="mz-count" style={{ ...panel, fontFamily: DISPLAY, fontSize: "clamp(1.6rem, 6.5cqw, 2.2rem)", lineHeight: 1.1, margin: 0, padding: "0.9rem 1.1rem", textAlign: "center" }}>
        {left <= -DAY ? "Newly married." : "Today is the day."}
      </p>
    );
  }

  const days = left === null ? null : Math.floor(left / DAY);
  const hours = left === null ? null : Math.floor((left % DAY) / 3600);
  const minutes = left === null ? null : Math.floor((left % 3600) / 60);
  const pad = (n: number | null) => (n === null ? "––" : String(n).padStart(2, "0"));
  const units = [
    { label: days === 1 ? "Day" : "Days", value: days === null ? "–––" : String(days) },
    { label: hours === 1 ? "Hour" : "Hours", value: pad(hours) },
    { label: minutes === 1 ? "Minute" : "Minutes", value: pad(minutes) },
  ];
  const spoken = left === null ? undefined : `${days} days, ${hours} hours and ${minutes} minutes to go`;

  return (
    <div role="timer" aria-label={spoken} className="mz-count" style={panel}>
      <p aria-hidden style={{ fontFamily: ENGRAVED, fontSize: 13, letterSpacing: "0.14em", color: p.lamp, margin: 0, padding: "0.45rem 0 0.4rem", textAlign: "center", borderBottom: rule }}>
        Arriving in
      </p>
      <ul aria-hidden style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {units.map((u, i) => (
          <li key={u.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--mz-count-pad) 0.25rem", borderLeft: i ? rule : undefined }}>
            <span style={{ fontFamily: DISPLAY, fontSize: "var(--mz-count-num)", lineHeight: 1, fontVariantNumeric: "tabular-nums lining-nums" }}>{u.value}</span>
            <span style={{ fontFamily: ENGRAVED, fontSize: 13, letterSpacing: "0.1em", color: soft, marginTop: "0.4rem" }}>{u.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
