"use client";

import { useSyncExternalStore } from "react";
import type { Palette } from "../theme";
import { DISPLAY, MONO, labelText } from "../theme";

const subscribe = (onTick: () => void) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
// The server renders dashes, so hydration never disagrees with the clock.
const serverSeconds = () => null;
const DAY = 86_400;

/** An olive band between sheets: the days left set as large light numerals over typed units, divided by hairlines. */
export default function CountdownBand({ target, palette: p }: { target: Date; palette: Palette }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const left = now === null ? null : Math.floor(target.getTime() / 1000) - now;
  const rule = `1px solid color-mix(in srgb, ${p.sheet} 22%, transparent)`;

  const body =
    left !== null && left <= 0 ? (
      <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(2rem, 9cqw, 2.8rem)", color: p.sheet, margin: 0, textAlign: "center" }}>
        {left <= -DAY ? "Newly married" : "Today is the day"}
      </p>
    ) : (
      (() => {
        const units = [
          { label: "Days", value: left === null ? null : Math.floor(left / DAY) },
          { label: "Hours", value: left === null ? null : Math.floor((left % DAY) / 3600) },
          { label: "Minutes", value: left === null ? null : Math.floor((left % 3600) / 60) },
          { label: "Seconds", value: left === null ? null : left % 60 },
        ];
        const spoken = left === null ? undefined : `${units[0].value} days, ${units[1].value} hours and ${units[2].value} minutes to go`;
        return (
          <div role="timer" aria-label={spoken}>
            <div aria-hidden style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
              {units.map((u, i) => (
                <div key={u.label} style={{ textAlign: "center", padding: "0.2rem 0.25rem", borderLeft: i ? rule : "none" }}>
                  <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(2rem, 10cqw, 3rem)", lineHeight: 1, color: p.sheet, fontVariantNumeric: "tabular-nums lining-nums" }}>
                    {u.value === null ? "–" : String(u.value).padStart(2, "0")}
                  </span>
                  <span style={{ display: "block", fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: `color-mix(in srgb, ${p.sheet} 72%, transparent)`, marginTop: 8 }}>{u.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()
    );

  return (
    <section aria-label="Countdown" style={{ background: p.ink, padding: "2rem clamp(1.25rem, 6cqw, 2rem) 1.8rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ ...labelText(p, 10), color: `color-mix(in srgb, ${p.sheet} 70%, transparent)`, textAlign: "center", margin: "0 0 1.2rem" }}>Until we gather</p>
        {body}
      </div>
    </section>
  );
}
