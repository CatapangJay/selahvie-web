"use client";

import { useEffect, useRef } from "react";

/* ── Generates dreamy floating sparkle / fairy-dust particles ────────────── */

const PARTICLE_COUNT = 60;
const BASE = "#0c0d1a";

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;    // px
  delay: number;   // s
  dur: number;     // s
  color: string;
  variant: "diamond" | "dot" | "cross";
}

const COLORS = [
  "rgba(200, 180, 240, 0.85)",  // lavender
  "rgba(232, 213, 163, 0.9)",   // stardust gold
  "rgba(200, 212, 232, 0.75)",  // moonlight silver
  "rgba(255, 255, 255, 0.6)",   // pure white
];

const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  top:     `${Math.random() * 100}%`,
  left:    `${Math.random() * 100}%`,
  size:    Math.random() < 0.15 ? 5 : Math.random() < 0.4 ? 3 : 2,
  delay:   Math.random() * 8,
  dur:     5 + Math.random() * 7,
  color:   COLORS[Math.floor(Math.random() * COLORS.length)],
  variant: (["diamond", "dot", "cross"] as const)[Math.floor(Math.random() * 3)],
}));

export default function Sparkles() {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes wsFloat {
        0%   { transform: translateY(0)   scale(1)    rotate(0deg);   opacity: 0; }
        15%  { opacity: 1; }
        75%  { opacity: 0.7; }
        100% { transform: translateY(-90px) scale(0.4) rotate(200deg); opacity: 0; }
      }
      @keyframes wsPulse {
        0%,100% { transform: scale(1);   opacity: 0.35; }
        50%     { transform: scale(1.6); opacity: 0.95; }
      }
      @keyframes wsDrift {
        0%   { transform: translateX(0)   translateY(0); }
        33%  { transform: translateX(18px) translateY(-12px); }
        66%  { transform: translateX(-10px) translateY(-28px); }
        100% { transform: translateX(5px)  translateY(-50px); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {particles.map((p) => {
        const anim =
          p.variant === "dot"
            ? `wsPulse ${p.dur}s ${p.delay}s infinite ease-in-out`
            : `wsFloat ${p.dur}s ${p.delay}s infinite ease-in-out, wsDrift ${p.dur * 1.3}s ${p.delay}s infinite ease-in-out`;

        if (p.variant === "diamond") {
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                background: p.color,
                transform: "rotate(45deg)",
                animation: anim,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              }}
            />
          );
        }

        if (p.variant === "cross") {
          return (
            <div
              key={p.id}
              style={{ position: "absolute", top: p.top, left: p.left, animation: anim }}
            >
              <div style={{ position: "relative", width: p.size * 2, height: p.size * 2 }}>
                <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 1, background: p.color, transform: "translateY(-50%)" }} />
                <div style={{ position: "absolute", left: "50%", top: 0, height: "100%", width: 1, background: p.color, transform: "translateX(-50%)" }} />
              </div>
            </div>
          );
        }

        // dot
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              animation: anim,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        );
      })}
    </div>
  );
}
