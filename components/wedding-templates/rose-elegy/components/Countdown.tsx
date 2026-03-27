"use client";

import { useState, useEffect } from "react";

interface Props {
  targetDate: string;
}

export default function Countdown({ targetDate }: Props) {
  const [units, setUnits] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return;
      setUnits({
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="flex items-end gap-4 justify-center">
      {[
        { val: units.days,    label: "Days"    },
        { val: units.hours,   label: "Hours"   },
        { val: units.minutes, label: "Minutes" },
        { val: units.seconds, label: "Seconds" },
      ].map(({ val, label }, i) => (
        <div key={label} className="flex items-end gap-4">
          {i > 0 && (
            <span className="pb-3 text-2xl font-light" style={{ color: "rgba(255,255,255,0.4)" }}>
              :
            </span>
          )}
          <div className="text-center min-w-[3rem]">
            <p
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                lineHeight: 1,
                color: "#fff",
              }}
            >
              {String(val).padStart(2, "0")}
            </p>
            <p
              className="label-luxury mt-1"
              style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.6rem" }}
            >
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
