"use client";

import { useEffect, useRef } from "react";

/* Floating magical fireflies & ember particles */

const FIREFLY_COUNT = 55;

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  delayS: number;
  durS: number;
  driftX: number;
  driftY: number;
  color: string;
  type: "glow" | "ember" | "wisp";
}

const COLORS = [
  "rgba(212,175,55,0.9)",    // gold firefly
  "rgba(126,200,164,0.8)",   // mint wisp
  "rgba(255,255,255,0.6)",   // silver spark
  "rgba(180,220,180,0.7)",   // soft green
  "rgba(230,210,130,0.75)",  // warm gold ember
];

const fireflies: Particle[] = Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
  id: i,
  top:    `${Math.random() * 100}%`,
  left:   `${Math.random() * 100}%`,
  size:   Math.random() < 0.2 ? 4 : Math.random() < 0.5 ? 3 : 2,
  delayS: Math.random() * 10,
  durS:   6 + Math.random() * 10,
  driftX: (Math.random() - 0.5) * 80,
  driftY: -(30 + Math.random() * 100),
  color:  COLORS[Math.floor(Math.random() * COLORS.length)],
  type:   (["glow", "ember", "wisp"] as const)[Math.floor(Math.random() * 3)],
}));

export default function FloatingParticles({ opacity = 1 }: { opacity?: number }) {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes egFloat {
        0%   { opacity: 0; transform: translate(0,0) scale(0.6); }
        15%  { opacity: 1; }
        80%  { opacity: 0.7; }
        100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.3) rotate(180deg); }
      }
      @keyframes egPulse {
        0%,100% { opacity: 0.2; transform: scale(0.8); }
        50%     { opacity: 1;   transform: scale(1.6); }
      }
      @keyframes egWisp {
        0%   { opacity: 0; transform: translateY(0) scaleX(1); }
        20%  { opacity: 0.8; }
        60%  { opacity: 0.6; transform: translateY(var(--dy)) scaleX(1.4); }
        100% { opacity: 0; transform: translateY(var(--dy)) scaleX(0.3); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 1, opacity }}
    >
      {fireflies.map((p) => {
        const anim = p.type === "glow"
          ? `egFloat ${p.durS}s ${p.delayS}s infinite ease-in-out`
          : p.type === "ember"
          ? `egPulse ${p.durS * 0.6}s ${p.delayS}s infinite ease-in-out`
          : `egWisp ${p.durS}s ${p.delayS}s infinite ease-in-out`;

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.type === "wisp" ? p.size * 4 : p.size,
              borderRadius: p.type === "wisp" ? "50%" : "50%",
              background: p.color,
              animation: anim,
              boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${p.color}`,
              // CSS custom properties for keyframe targets
              ["--dx" as string]: `${p.driftX}px`,
              ["--dy" as string]: `${p.driftY}px`,
            }}
          />
        );
      })}
    </div>
  );
}
