"use client";

import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  gold: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}

/** The amber/gold pill button seen throughout the design reference. */
export default function GoldPillButton({ children, gold, onClick, type = "button", className = "", disabled }: Props) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.04, boxShadow: `0 6px 28px ${gold}50` }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase transition-all ${className}`}
      style={{
        background: gold,
        color: "#1a2417",
        fontFamily: "var(--font-sans)",
        letterSpacing: "0.1em",
        boxShadow: `0 4px 18px ${gold}40`,
      }}
    >
      {children}
    </motion.button>
  );
}
