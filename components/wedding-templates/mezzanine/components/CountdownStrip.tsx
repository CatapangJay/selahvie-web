"use client";

import { useSyncExternalStore } from "react";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, ENGRAVED, GUTTER, SANS } from "../theme";

const subscribe = (onTick: () => void) => {
  // Minutes are the finest unit shown; a slow tick keeps the strip still.
  const id = setInterval(onTick, 15_000);
  return () => clearInterval(id);
};
/** Rounded to the minute, so the snapshot only changes when the readout does. */
const nowSeconds = () => Math.floor(Date.now() / 60_000) * 60;
// The server renders dashes so hydration never disagrees with the clock.
const serverSeconds = () => null;
const DAY = 86_400;

/**
 * The indicator strip: one large numeral for the days, the hours and minutes
 * stacked beside it like the small readouts on a lift panel.
 */
export default function CountdownStrip({ date, palette: p }: { date: DateParts; palette: Palette }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const target = date.date;
  if (!target) return null;
  const left = now === null ? null : Math.floor(target.getTime() / 1000) - now;
  const soft = `color-mix(in srgb, ${p.linenOn} 74%, transparent)`;
  const rule = `1px solid color-mix(in srgb, ${p.bronzeLight} 40%, transparent)`;
  const pad = (n: number | null) => (n === null ? "––" : String(n).padStart(2, "0"));

  const small = left === null || left > 0
    ? [
        { label: "Hours", value: left === null ? null : Math.floor((left % DAY) / 3600) },
        { label: "Minutes", value: left === null ? null : Math.floor((left % 3600) / 60) },
      ]
    : [];
  const days = left === null ? null : Math.floor(left / DAY);
  const spoken = left === null || left <= 0 ? undefined : `${days} days, ${small[0].value} hours and ${small[1].value} minutes to go`;

  return (
    <section aria-label="Countdown" style={{ background: p.oxblood, color: p.linenOn, padding: `2.6rem ${GUTTER} 2.8rem`, borderTop: rule }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {left !== null && left <= 0 ? (
          <p style={{ fontFamily: DISPLAY, fontSize: "clamp(2rem, 9.5cqw, 3rem)", lineHeight: 1.1, margin: 0 }}>{left <= -DAY ? "Newly married." : "Today is the day."}</p>
        ) : (
          <div role="timer" aria-label={spoken} style={{ display: "flex", alignItems: "stretch", gap: "clamp(1rem, 6cqw, 2rem)" }}>
            <div aria-hidden style={{ flex: "1 1 auto", minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: DISPLAY, fontSize: "clamp(4.2rem, 25cqw, 6rem)", lineHeight: 0.9, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums lining-nums" }}>{days === null ? "–––" : days}</span>
              <span style={{ display: "block", fontFamily: ENGRAVED, fontSize: 14, letterSpacing: "0.12em", color: soft, marginTop: 10 }}>{days === 1 ? "Day" : "Days"} to go</span>
            </div>
            <ul aria-hidden style={{ listStyle: "none", margin: 0, padding: "0 0 0 clamp(1rem, 6cqw, 2rem)", borderLeft: rule, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6 }}>
              {small.map((u) => (
                <li key={u.label} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: "clamp(1.5rem, 7cqw, 2rem)", lineHeight: 1, fontVariantNumeric: "tabular-nums lining-nums", minWidth: "2ch" }}>{pad(u.value)}</span>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: soft }}>{u.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {date.long && <p style={{ fontFamily: SANS, fontSize: 15, color: soft, margin: "1.6rem 0 0", paddingTop: "1rem", borderTop: rule }}>Until {date.long}</p>}
      </div>
    </section>
  );
}
