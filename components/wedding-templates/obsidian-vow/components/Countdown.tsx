"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  targetDate: string;
}

export default function Countdown({ targetDate }: Props) {
  const [units, setUnits] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
      setPrevUnits(units);
      setUnits(next);
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  const segments = [
    { val: units.days,    prev: prevUnits.days,    label: "Days"    },
    { val: units.hours,   prev: prevUnits.hours,   label: "Hours"   },
    { val: units.minutes, prev: prevUnits.minutes, label: "Min"     },
    { val: units.seconds, prev: prevUnits.seconds, label: "Sec"     },
  ];

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-6">
      {segments.map(({ val, prev, label }, i) => (
        <div key={label} className="flex items-end gap-2 sm:gap-6">
          {i > 0 && (
            <span
              className="pb-4 text-3xl font-thin"
              style={{ color: "rgba(201,168,76,0.4)" }}
            >
              :
            </span>
          )}
          <div className="text-center" style={{ minWidth: "3.5rem" }}>
            {/* Flip animation when value changes */}
            <div className="relative h-14 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={val}
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0,   opacity: 1 }}
                  exit={{    y:  40, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="tabular-nums absolute inset-x-0 text-center"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(2rem, 5vw, 3.25rem)",
                    lineHeight: 1,
                    color: "#c9a84c",
                    textShadow: "0 0 30px rgba(201,168,76,0.5)",
                  }}
                >
                  {String(val).padStart(2, "0")}
                </motion.p>
              </AnimatePresence>
            </div>
            <p
              className="label-luxury mt-1"
              style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6rem", letterSpacing: "0.18em" }}
            >
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
