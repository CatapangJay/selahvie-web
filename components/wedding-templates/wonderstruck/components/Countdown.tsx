"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  targetDate: string;
  accent: string;
  gold: string;
}

export default function Countdown({ targetDate, accent, gold }: Props) {
  const [units, setUnits]         = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [prevUnits, setPrevUnits] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return;
      const next = {
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000)  / 60_000),
        seconds: Math.floor((diff % 60_000)     / 1_000),
      };
      setPrevUnits(u => u);
      setUnits(next);
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  const segments = [
    { val: units.days,    label: "Days"    },
    { val: units.hours,   label: "Hours"   },
    { val: units.minutes, label: "Min"     },
    { val: units.seconds, label: "Sec"     },
  ];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-8">
      {segments.map(({ val, label }, i) => (
        <div key={label} className="flex items-end gap-3 sm:gap-8">
          {i > 0 && (
            <span className="pb-4 text-2xl font-thin" style={{ color: `${accent}50` }}>·</span>
          )}
          <div className="text-center" style={{ minWidth: "3.5rem" }}>
            <div className="relative h-14 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={val}
                  initial={{ y: -38, opacity: 0 }}
                  animate={{ y: 0,   opacity: 1 }}
                  exit={{    y:  38, opacity: 0 }}
                  transition={{ duration: 0.38, ease: "easeOut" as const }}
                  className="tabular-nums absolute inset-x-0 text-center"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(2rem, 5vw, 3.25rem)",
                    lineHeight: 1,
                    color: gold,
                    textShadow: `0 0 28px ${gold}70`,
                  }}
                >
                  {String(val).padStart(2, "0")}
                </motion.p>
              </AnimatePresence>
            </div>
            <p
              className="mt-1 uppercase tracking-widest"
              style={{ color: `${accent}60`, fontSize: "0.6rem", letterSpacing: "0.18em" }}
            >
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
