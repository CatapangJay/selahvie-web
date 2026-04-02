"use client";

import { motion } from "framer-motion";

interface Props {
  green: string;
  floral?: string;
  width?: number;
  height?: number;
  animationDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animated botanical vine that draws itself via Framer Motion pathLength.
 * Each leaf/branch fans in after the central stem completes.
 * Uses only transform + opacity — hardware-accelerated.
 */
export default function BotanicalOrnament({
  green,
  floral,
  width = 160,
  height = 280,
  animationDelay = 0,
  className = "",
  style,
}: Props) {
  const accent = floral ?? green;
  const duration = 1.8;
  const d = animationDelay;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 280"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Central stem */}
      <motion.path
        d="M80 270 C80 230 78 190 76 155 C74 120 72 90 80 60 C84 42 88 25 85 10"
        stroke={green}
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration, delay: d, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Large left leaf — lower */}
      <motion.path
        d="M76 200 C60 190 30 185 14 172 C10 168 12 162 20 163 C38 164 62 175 76 200Z"
        fill={`${green}25`}
        stroke={green}
        strokeWidth="0.8"
        initial={{ pathLength: 0, opacity: 0, scale: 0.6, originX: "76px", originY: "186px" }}
        animate={{ pathLength: 1, opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: d + 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Large right leaf — lower */}
      <motion.path
        d="M80 200 C96 190 126 185 142 172 C146 168 144 162 136 163 C118 164 94 175 80 200Z"
        fill={`${green}25`}
        stroke={green}
        strokeWidth="0.8"
        initial={{ pathLength: 0, opacity: 0, scale: 0.6 }}
        animate={{ pathLength: 1, opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: d + 0.65, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Mid left leaf */}
      <motion.path
        d="M77 155 C62 145 36 138 20 122 C16 118 19 110 28 113 C48 120 70 137 77 155Z"
        fill={`${green}20`}
        stroke={green}
        strokeWidth="0.8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, delay: d + 0.8, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Mid right leaf */}
      <motion.path
        d="M79 155 C94 145 120 138 136 122 C140 118 137 110 128 113 C108 120 86 137 79 155Z"
        fill={`${green}20`}
        stroke={green}
        strokeWidth="0.8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, delay: d + 0.9, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Upper left spray */}
      <motion.path
        d="M78 100 C66 90 46 80 30 65 C26 61 29 54 38 58 C56 66 72 84 78 100Z"
        fill={`${green}18`}
        stroke={green}
        strokeWidth="0.7"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: d + 1.0, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Upper right spray */}
      <motion.path
        d="M82 100 C94 90 114 80 130 65 C134 61 131 54 122 58 C104 66 88 84 82 100Z"
        fill={`${green}18`}
        stroke={green}
        strokeWidth="0.7"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: d + 1.1, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Small floral blossom nodes — 3 dots along stem */}
      {[{ cx: 79, cy: 235, r: 3 }, { cx: 78, cy: 175, r: 2.5 }, { cx: 80, cy: 120, r: 2.5 }].map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={accent}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ type: "spring", stiffness: 180, damping: 16, delay: d + 0.7 + i * 0.15 }}
        />
      ))}

      {/* Top blossom */}
      <motion.circle
        cx={84}
        cy={18}
        r={5}
        fill={`${accent}40`}
        stroke={accent}
        strokeWidth="0.8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 14, delay: d + 1.5 }}
      />
    </svg>
  );
}
