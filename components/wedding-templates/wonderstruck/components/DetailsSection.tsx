"use client";

import { motion, type Variants } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import Divider from "./Divider";

interface Props {
  config: WeddingConfig;
  accent: string;
  gold: string;
  weddingDateFormatted: string;
}

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const cards = [
  { icon: Calendar, label: "Date",  key: "date" as const },
  { icon: MapPin,   label: "Venue", key: "venue" as const },
  { icon: Clock,    label: "Time",  key: "time" as const },
];

export default function DetailsSection({ config, accent, gold, weddingDateFormatted }: Props) {
  const values = {
    date:  weddingDateFormatted || "Date to be announced",
    venue: config.venueName
      ? `${config.venueName}${config.venueCity ? `, ${config.venueCity}` : ""}`
      : "Venue to be announced",
    time: weddingDateFormatted ? "Details to follow" : "Time to be announced",
  };

  return (
    <section
      className="py-24 px-6"
      style={{ background: "#0e0f1e", borderTop: `1px solid ${accent}10` }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          className="text-center mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-xs mb-3" style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}>
            Wedding Details
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              color: "#f0ecf8",
            }}
          >
            The Enchanted Evening
          </h2>
          <Divider accent={accent} gold={gold} />
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {cards.map(({ icon: Icon, label, key }) => (
            <motion.div
              key={key}
              variants={cardVariant}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="relative rounded-2xl p-8 text-center overflow-hidden group"
              style={{
                background: `linear-gradient(145deg, ${accent}08, ${accent}04)`,
                border: `1px solid ${accent}20`,
              }}
            >
              {/* Corner bracket top-left */}
              <div
                className="absolute top-3 left-3 w-5 h-5 border-t border-l transition-all duration-300 group-hover:w-7 group-hover:h-7"
                style={{ borderColor: `${gold}60` }}
              />
              {/* Corner bracket bottom-right */}
              <div
                className="absolute bottom-3 right-3 w-5 h-5 border-b border-r transition-all duration-300 group-hover:w-7 group-hover:h-7"
                style={{ borderColor: `${gold}60` }}
              />

              {/* Icon */}
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{ background: `${gold}10`, border: `1px solid ${gold}30` }}
              >
                <Icon size={20} style={{ color: gold }} />
              </div>

              <p
                className="uppercase tracking-widest text-xs mb-2"
                style={{ color: `${accent}60`, fontFamily: "var(--font-sans)" }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.05rem",
                  color: "#f0ecf8",
                  lineHeight: 1.5,
                }}
              >
                {values[key]}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Venue address */}
        {config.venueAddress && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" as const }}
            className="text-center mt-6 text-sm"
            style={{ color: `${accent}50`, letterSpacing: "0.06em" }}
          >
            {config.venueAddress}
          </motion.p>
        )}
      </div>
    </section>
  );
}
