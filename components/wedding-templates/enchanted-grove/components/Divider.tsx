"use client";

import { motion } from "framer-motion";

interface Props {
  gold: string;
  accent: string;
}

export default function Divider({ gold, accent }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.7, ease: "easeOut" as const }}
        className="origin-right h-px flex-1 max-w-24"
        style={{ background: `linear-gradient(to right, transparent, ${gold}60)` }}
      />
      {/* Leaf ornament */}
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden>
        <path
          d="M12 1 C6 1, 1 5, 1 8 C1 11, 6 15, 12 15 C18 15, 23 11, 23 8 C23 5, 18 1, 12 1Z"
          fill={`${gold}20`}
          stroke={gold}
          strokeWidth="0.8"
        />
        <line x1="12" y1="1" x2="12" y2="15" stroke={gold} strokeWidth="0.6" opacity="0.6" />
        <line x1="8"  y1="4" x2="12" y2="8"  stroke={gold} strokeWidth="0.4" opacity="0.4" />
        <line x1="16" y1="4" x2="12" y2="8"  stroke={gold} strokeWidth="0.4" opacity="0.4" />
      </svg>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.7, ease: "easeOut" as const }}
        className="origin-left h-px flex-1 max-w-24"
        style={{ background: `linear-gradient(to left, transparent, ${gold}60)` }}
      />
    </div>
  );
}
