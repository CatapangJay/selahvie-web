"use client";

import { useSyncExternalStore } from "react";
import type { Palette } from "../theme";
import { SCRIPT, SERIF } from "../theme";

interface Props {
  /** Local midnight of the wedding day. */
  target: Date;
  palette: Palette;
}

const subscribe = (onTick: () => void) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
// Server render shows the frame without numbers, so hydration never disagrees with the clock.
const serverSeconds = () => null;

const DAY = 86_400;

/** Days, hours, minutes and seconds to the wedding, set like engraved numerals between gilt rules. */
export default function Countdown({ target, palette: p }: Props) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const start = Math.floor(target.getTime() / 1000);
  const left = now === null ? null : start - now;

  if (left !== null && left <= 0) {
    const married = left <= -DAY;
    return (
      <p className="text-center" style={{ fontFamily: SCRIPT, fontSize: "clamp(2rem, 6vw, 2.8rem)", lineHeight: 1.2, color: p.goldLight }}>
        {married ? "Happily married" : "Today is the day"}
      </p>
    );
  }

  const units = [
    { label: "Days", value: left === null ? null : Math.floor(left / DAY) },
    { label: "Hours", value: left === null ? null : Math.floor((left % DAY) / 3600) },
    { label: "Minutes", value: left === null ? null : Math.floor((left % 3600) / 60) },
    { label: "Seconds", value: left === null ? null : left % 60 },
  ];
  const spoken =
    left === null ? undefined : `${units[0].value} days, ${units[1].value} hours and ${units[2].value} minutes to go`;

  return (
    <div className="text-center">
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(1.1rem, 2.6vw, 1.3rem)", color: p.goldLight }}>
        Counting down the days
      </p>

      <div
        role="timer"
        aria-label={spoken}
        className="mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          alignItems: "start",
          maxWidth: "34rem",
          marginTop: "1.1rem",
          padding: "clamp(1rem, 3vw, 1.4rem) 0",
          borderBlock: `1px solid ${p.gold}`,
          boxShadow: `0 -5px 0 -4px ${p.gold}80, 0 5px 0 -4px ${p.gold}80`,
        }}
      >
        {units.map((u, i) => (
          <div key={u.label} aria-hidden className="relative">
            {i > 0 && (
              <span
                className="absolute"
                style={{ left: 0, top: "38%", width: 6, height: 6, transform: "translate(-50%, -50%) rotate(45deg)", background: p.gold }}
              />
            )}
            <p
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.2rem, 8vw, 3.4rem)",
                lineHeight: 1,
                fontVariantNumeric: "lining-nums tabular-nums",
                color: p.cream,
                textShadow: "0 2px 12px rgba(0,0,0,.3)",
              }}
            >
              {u.value === null ? "–" : String(u.value).padStart(2, "0")}
            </p>
            <p
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: "clamp(0.62rem, 1.8vw, 0.75rem)",
                letterSpacing: "0.26em",
                paddingLeft: "0.26em",
                textTransform: "uppercase",
                color: p.goldLight,
                marginTop: "0.6rem",
              }}
            >
              {u.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
