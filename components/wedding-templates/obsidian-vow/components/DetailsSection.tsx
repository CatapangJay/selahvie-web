"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
import SectionLabel from "./SectionLabel";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
  weddingDateFormatted: string;
}

export default function DetailsSection({ config, accent, weddingDateFormatted }: Props) {
  const cards = [
    {
      icon: Calendar,
      label: "Date",
      value: weddingDateFormatted || "TBD",
    },
    {
      icon: MapPin,
      label: "Venue",
      value:
        [config.venueName, config.venueAddress, config.venueCity].filter(Boolean).join(", ") ||
        "TBD",
    },
    {
      icon: Clock,
      label: "Ceremony Begins",
      value: "8:00 PM",
    },
  ];

  return (
    <section
      className="py-28 relative overflow-hidden"
      style={{ background: "#0f0d0b" }}
    >
      {/* Decorative horizontal rule */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${accent}25, transparent)` }}
      />

      <div className="mx-auto max-w-5xl px-6">
        <SectionLabel eyebrow="Wedding Day" title="The Details" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {cards.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-5 p-10 text-center relative group"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${accent}15`,
              }}
            >
              {/* Gold corner accent – top left */}
              <div
                className="absolute top-0 left-0 w-4 h-4 border-t border-l transition-all duration-300 group-hover:w-6 group-hover:h-6"
                style={{ borderColor: `${accent}60` }}
              />
              {/* Bottom right */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 border-b border-r transition-all duration-300 group-hover:w-6 group-hover:h-6"
                style={{ borderColor: `${accent}60` }}
              />

              <div
                className="flex h-14 w-14 items-center justify-center"
                style={{ border: `1px solid ${accent}30`, background: `${accent}08` }}
              >
                <Icon size={22} style={{ color: accent }} />
              </div>
              <p className="label-luxury" style={{ color: `${accent}80`, letterSpacing: "0.18em" }}>
                {label}
              </p>
              <p
                className="text-sm font-light leading-snug"
                style={{ color: "rgba(245,240,232,0.75)" }}
              >
                {value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${accent}25, transparent)` }}
      />
    </section>
  );
}
