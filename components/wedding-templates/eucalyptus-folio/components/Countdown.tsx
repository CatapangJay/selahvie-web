"use client";

import { useSyncExternalStore } from "react";
import type { Palette } from "../theme";
import { DISPLAY, MONO } from "../theme";

const subscribe = (onTick: () => void) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
// The server renders dashes, so hydration never disagrees with the clock.
const serverSeconds = () => null;
const DAY = 86_400;

/**
 * The time left, typed into the specimen label: four equal cells split by
 * hairlines, light serif numerals over typed units, so the figures never shift
 * as the clock ticks.
 */
export default function Countdown({ target, palette: p }: { target: Date; palette: Palette }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const left = now === null ? null : Math.floor(target.getTime() / 1000) - now;
  const rule = `1px solid color-mix(in srgb, ${p.ink} 22%, transparent)`;

  if (left !== null && left <= 0) {
    return (
      <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(1.5rem, 4svh, 2rem)", lineHeight: 1.2, color: p.ink, margin: 0 }}>
        {left <= -DAY ? "Newly married" : "Today is the day"}
      </p>
    );
  }

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
          <div key={u.label} style={{ textAlign: "center", padding: "0 0.2rem", borderLeft: i ? rule : "none" }}>
            <span
              className="text-[clamp(1.55rem,4.4svh,2rem)] lg:text-[clamp(1.9rem,5.4svh,3rem)]"
              style={{ display: "block", fontFamily: DISPLAY, fontWeight: 300, lineHeight: 1, color: p.ink, fontVariantNumeric: "tabular-nums lining-nums" }}
            >
              {u.value === null ? "–" : String(u.value).padStart(2, "0")}
            </span>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: p.inkSoft, marginTop: 6 }}>{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
