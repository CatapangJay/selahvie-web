"use client";

import { motion, type Variants } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import Divider from "./Divider";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
  weddingDateFormatted: string;
}

/* Each card continuously levitates — staggered so they float at different phases */
const FLOAT_DELAYS = [0, 1.2, 2.4];

const cardEntry: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.94 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
};
const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

export default function DetailsSection({ config, gold, accent, weddingDateFormatted }: Props) {
  const cards = [
    {
      icon: Calendar,
      label: "Date",
      value: weddingDateFormatted || "Date to be announced",
      floatDelay: FLOAT_DELAYS[0],
    },
    {
      icon: MapPin,
      label: "Venue",
      value: config.venueName
        ? `${config.venueName}${config.venueCity ? `, ${config.venueCity}` : ""}`
        : "Venue to be announced",
      floatDelay: FLOAT_DELAYS[1],
    },
    {
      icon: Clock,
      label: "Ceremony",
      value: weddingDateFormatted ? "Details to follow" : "Time to be announced",
      floatDelay: FLOAT_DELAYS[2],
    },
  ];

  return (
    <section
      className="relative overflow-hidden py-28 px-6"
      style={{ background: "#060e12", borderTop: `1px solid ${gold}10` }}
    >
      {/* Background texture glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% 60%, ${accent}07 0%, transparent 70%)` }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="text-center mb-16"
        >
          <p className="uppercase tracking-[0.26em] text-xs mb-3" style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}>
            Wedding Details
          </p>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#eef5ee" }}>
            The Enchanted Day
          </h2>
          <Divider gold={gold} accent={accent} />
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {cards.map(({ icon: Icon, label, value, floatDelay }) => (
            <motion.div
              key={label}
              variants={cardEntry}
            >
              {/* Continuously levitating wrapper */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4.5,
                  delay: floatDelay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.04 }}
                className="relative rounded-2xl p-8 text-center overflow-hidden group cursor-default"
                style={{
                  background: `linear-gradient(145deg, ${accent}0c, ${gold}06)`,
                  border: `1px solid ${gold}20`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${accent}08`,
                }}
              >
                {/* Magical glow that intensifies on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${gold}12, transparent 60%)` }}
                />

                {/* Growing corner brackets on hover */}
                {["top-3 left-3 border-t border-l", "top-3 right-3 border-t border-r",
                  "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-4 h-4 transition-all duration-400 group-hover:w-6 group-hover:h-6 ${cls}`}
                    style={{ borderColor: `${gold}50` }}
                  />
                ))}

                {/* Icon */}
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, delay: floatDelay + 1, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                  style={{ background: `${gold}12`, border: `1px solid ${gold}30` }}
                >
                  <Icon size={20} style={{ color: gold }} />
                </motion.div>

                <p className="uppercase tracking-widest text-xs mb-2" style={{ color: `${accent}55`, fontFamily: "var(--font-sans)" }}>
                  {label}
                </p>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", color: "#eef5ee", lineHeight: 1.55 }}>
                  {value}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Venue address */}
        {config.venueAddress && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-center mt-7 text-sm"
            style={{ color: `${accent}45`, letterSpacing: "0.07em" }}
          >
            {config.venueAddress}
          </motion.p>
        )}
      </div>
    </section>
  );
}
