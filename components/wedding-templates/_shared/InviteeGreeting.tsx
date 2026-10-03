"use client";

import { motion } from "framer-motion";

interface Props {
  name: string;
  message: string;
}

/**
 * Personal greeting laid over the top of any template's hero. Absolutely
 * positioned inside the render wrapper so it scrolls away with the hero and
 * never shifts the template's own layout. A dark scrim keeps it legible over
 * both photo heroes and light, text-only heroes.
 */
export default function InviteeGreeting({ name, message }: Props) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 flex justify-center px-4"
      style={{ top: "clamp(4.75rem, 11vh, 7rem)", zIndex: "var(--z-dropdown)" }}
    >
      <motion.div
        role="note"
        aria-label={`Invitation for ${name}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
        className="max-w-[min(34rem,100%)] px-6 py-4 text-center sm:px-8"
        style={{
          background: "rgba(24, 16, 20, 0.62)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          borderRadius: 999,
          color: "#fdf8f7",
        }}
      >
        <p
          className="truncate"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(1.05rem, 2.6vw, 1.3rem)", lineHeight: 1.3 }}
        >
          Dear {name},
        </p>
        <p className="mt-0.5 text-xs font-light sm:text-sm" style={{ color: "rgba(253, 248, 247, 0.85)" }}>
          {message}
        </p>
      </motion.div>
    </div>
  );
}
