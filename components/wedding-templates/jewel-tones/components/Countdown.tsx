"use client";

import { useSyncExternalStore } from "react";
import type { Palette } from "../theme";
import { SCRIPT, SERIF } from "../theme";

interface Props {
  /** Local midnight of the wedding day. */
  target: Date;
  palette: Palette;
  className?: string;
}

const subscribe = (onTick: () => void) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
// Server render shows the frame without numbers, so hydration never disagrees with the clock.
const serverSeconds = () => null;

const DAY = 86_400;

/**
 * Days, hours, minutes and seconds to the wedding, set like engraved numerals
 * between double gilt rules. Four equal cells with tabular figures, so nothing
 * shifts as the clock ticks. Sized off the viewport height so it fits the hero's first screen.
 */
export default function Countdown({ target, palette: p, className }: Props) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const start = Math.floor(target.getTime() / 1000);
  const left = now === null ? null : start - now;

  if (left !== null && left <= 0) {
    const married = left <= -DAY;
    return (
      <p className={className} style={{ fontFamily: SCRIPT, fontSize: "clamp(2rem, 6vw, 2.8rem)", lineHeight: 1.2, color: p.goldLight }}>
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
    <div
      role="timer"
      aria-label={spoken}
      className={`grid w-full grid-cols-4 items-start py-[clamp(0.6rem,1.6svh,1rem)] ${className ?? ""}`}
      style={{
        borderBlock: `1px solid ${p.gold}`,
        boxShadow: `0 -5px 0 -4px ${p.gold}80, 0 5px 0 -4px ${p.gold}80`,
      }}
    >
      {units.map((u, i) => (
        <div key={u.label} aria-hidden className="relative text-center">
          {i > 0 && (
            <span
              className="absolute"
              style={{ left: 0, top: "36%", width: 5, height: 5, transform: "translate(-50%, -50%) rotate(45deg)", background: p.gold }}
            />
          )}
          <p
            className="text-[clamp(1.6rem,min(8vw,5svh),2.4rem)] lg:text-[clamp(2rem,5.2svh,2.9rem)]"
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
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
              fontSize: "0.68rem",
              letterSpacing: "0.24em",
              paddingLeft: "0.24em",
              textTransform: "uppercase",
              color: p.goldLight,
              marginTop: "0.45rem",
            }}
          >
            {u.label}
          </p>
        </div>
      ))}
    </div>
  );
}
