"use client";

import { motion, type Variants } from "framer-motion";
import { Calendar, MapPin, Clock, Sparkles, Shirt } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import {
  ceremonyVenue,
  receptionVenue,
  receptionTimeAtCeremony,
  hashtagOf,
  dressCodeOf,
  type VenueView,
} from "@/lib/weddingDetails";
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
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const dress = dressCodeOf(config);
  const hashtag = hashtagOf(config);

  const venueLines = (v: VenueView) => [v.name, v.address, v.city].filter(Boolean);

  const cards: {
    icon: typeof Calendar;
    label: string;
    lines: string[];
    venue?: VenueView;
    floatDelay: number;
    swatches?: string[];
  }[] = [
    {
      icon: Calendar,
      label: "Date",
      lines: [weddingDateFormatted || "Date to be announced"],
      floatDelay: FLOAT_DELAYS[0],
    },
    {
      icon: MapPin,
      label: "Ceremony Venue",
      lines: venueLines(ceremony).length ? venueLines(ceremony) : ["Venue to be announced"],
      venue: ceremony,
      floatDelay: FLOAT_DELAYS[1],
    },
    {
      icon: Clock,
      label: "Ceremony Time",
      lines: [ceremony.time || (weddingDateFormatted ? "Details to follow" : "Time to be announced")],
      floatDelay: FLOAT_DELAYS[2],
    },
  ];

  if (reception) {
    cards.push({
      icon: Sparkles,
      label: "Reception",
      lines: [...venueLines(reception), ...(reception.time ? [reception.time] : [])],
      venue: reception,
      floatDelay: FLOAT_DELAYS[0],
    });
  } else if (receptionTime) {
    cards.push({
      icon: Sparkles,
      label: "Reception",
      lines: [receptionTime, "At the ceremony venue"],
      floatDelay: FLOAT_DELAYS[0],
    });
  }

  if (dress) {
    cards.push({
      icon: Shirt,
      label: "Dress Code",
      lines: [dress.title, dress.description].filter(Boolean),
      swatches: dress.palette,
      floatDelay: FLOAT_DELAYS[1],
    });
  }

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
          {cards.map(({ icon: Icon, label, lines, venue, swatches, floatDelay }) => (
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
                {lines.map((line, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: i === 0 ? "1.05rem" : "0.9rem",
                      color: i === 0 ? "#eef5ee" : `${accent}90`,
                      lineHeight: 1.55,
                    }}
                  >
                    {line}
                  </p>
                ))}

                {swatches && swatches.length > 0 && (
                  <ul className="flex flex-wrap justify-center gap-2 mt-4" aria-label="Colour palette">
                    {swatches.map((hex) => (
                      <li
                        key={hex}
                        role="img"
                        aria-label={`Palette colour ${hex}`}
                        className="w-6 h-6 rounded-full"
                        style={{ background: hex, border: `1px solid ${gold}60`, boxShadow: `0 0 10px ${hex}40` }}
                      />
                    ))}
                  </ul>
                )}

                {venue && (venue.mapUrl || venue.directionsUrl) && (
                  <p className="relative flex flex-wrap justify-center gap-x-5 gap-y-1 mt-4 text-xs uppercase tracking-widest">
                    {venue.mapUrl && (
                      <a href={venue.mapUrl} target="_blank" rel="noopener" className="py-2 underline underline-offset-4" style={{ color: gold }}>
                        View map
                      </a>
                    )}
                    {venue.directionsUrl && (
                      <a href={venue.directionsUrl} target="_blank" rel="noopener" className="py-2 underline underline-offset-4" style={{ color: gold }}>
                        Get directions
                      </a>
                    )}
                  </p>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {hashtag && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-center mt-10"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.2rem", color: gold }}
          >
            {hashtag}
          </motion.p>
        )}
      </div>
    </section>
  );
}
