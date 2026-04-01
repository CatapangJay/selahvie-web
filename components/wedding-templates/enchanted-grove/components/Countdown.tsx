"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  targetDate: string;
  gold: string;
  accent: string;
}

export default function Countdown({ targetDate, gold, accent }: Props) {
  const [units, setUnits] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return;
      setUnits({
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000)  / 60_000),
        seconds: Math.floor((diff % 60_000)     / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  const segments = [
    { val: units.days,    label: "Days"  },
    { val: units.hours,   label: "Hours" },
    { val: units.minutes, label: "Min"   },
    { val: units.seconds, label: "Sec"   },
  ];

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-6">
      {segments.map(({ val, label }, i) => (
        <div key={label} className="flex items-end gap-2 sm:gap-6">
          {i > 0 && (
            <span className="pb-5 text-xl font-thin" style={{ color: `${gold}40` }}>·</span>
          )}
          <div className="text-center" style={{ minWidth: "3.5rem" }}>
            {/* Glowing card behind digit */}
            <div
              className="relative rounded-xl mb-1 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accent}12, ${gold}08)`,
                border: `1px solid ${gold}25`,
                boxShadow: `0 0 20px ${gold}10, inset 0 1px 0 ${gold}15`,
                height: "3.8rem",
                width: "3.8rem",
                margin: "0 auto",
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={val}
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0,   opacity: 1 }}
                  exit={{    y:  30, opacity: 0 }}
                  transition={{ duration: 0.32, ease: "easeOut" as const }}
                  className="absolute tabular-nums"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                    lineHeight: 1,
                    color: gold,
                    textShadow: `0 0 20px ${gold}70`,
                  }}
                >
                  {String(val).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>
            <p
              className="uppercase tracking-widest"
              style={{ color: `${accent}55`, fontSize: "0.58rem", letterSpacing: "0.2em" }}
            >
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
