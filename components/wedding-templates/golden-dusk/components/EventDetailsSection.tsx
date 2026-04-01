"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

interface EventCardProps {
  title: string;
  subtitle: string;
  date: string;
  time: string;
  venue: string;
  accent: string;
  index: number;
}

function EventCard({ title, subtitle, date, time, venue, accent, index }: EventCardProps) {
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
      className="flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: "200px",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      {/* Top color accent bar */}
      <div className="h-1.5" style={{ background: accent }} />

      <div className="p-5 flex flex-col gap-3">
        <div>
          <p
            className="text-xs uppercase tracking-[0.18em] mb-0.5"
            style={{ color: accent, fontFamily: "var(--font-sans)" }}
          >
            {subtitle}
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1.1rem",
              color: "#2c1810",
              lineHeight: 1.3,
            }}
          >
            {title}
          </p>
        </div>

        <div className="h-px" style={{ background: "rgba(44,24,16,0.1)" }} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar size={11} style={{ color: accent, flexShrink: 0 }} />
            <span className="text-xs" style={{ color: "rgba(44,24,16,0.65)", fontFamily: "var(--font-sans)" }}>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={11} style={{ color: accent, flexShrink: 0 }} />
            <span className="text-xs" style={{ color: "rgba(44,24,16,0.65)", fontFamily: "var(--font-sans)" }}>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={11} style={{ color: accent, flexShrink: 0 }} />
            <span className="text-xs" style={{ color: "rgba(44,24,16,0.65)", fontFamily: "var(--font-sans)" }}>{venue}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function buildEvents(config: WeddingConfig) {
  const d = config.weddingDate ? new Date(config.weddingDate) : new Date("2027-01-01");
  const fmt = (offset: number) => {
    const dt = new Date(d.getTime() + offset * 86400000);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const venue = config.venueName || "Main Venue";
  const city  = config.venueCity || "";
  const loc   = city ? `${venue}, ${city}` : venue;

  return [
    { title: "Ring Ceremony",       subtitle: "Event 01", date: fmt(-3), time: "10:00 AM",  venue: loc },
    { title: "Engagement Special",  subtitle: "Event 02", date: fmt(-2), time: "06:00 PM",  venue: loc },
    { title: "Mehndi Night",        subtitle: "Event 03", date: fmt(-1), time: "07:00 PM",  venue: loc },
    { title: "Wedding Ceremony",    subtitle: "Event 04", date: fmt(0),  time: "09:00 AM",  venue: loc },
    { title: "Haldi Celebration",   subtitle: "Event 05", date: fmt(-1), time: "10:00 AM",  venue: loc },
  ];
}

export default function EventDetailsSection({ config, accent }: Props) {
  const events = buildEvents(config);
  const bgUrl  = config.heroImageUrl
    ? config.heroImageUrl
    : `https://picsum.photos/seed/gd-event-bg/1600/800`;

  return (
    <section id="events" className="relative py-28 px-6 overflow-hidden">
      {/* Full-width panoramic background */}
      <div className="absolute inset-0">
        <Image src={bgUrl} alt="Event background" fill className="object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.65) 100%)" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          variants={cont}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Heading */}
          <div className="text-center mb-14">
            <motion.p
              variants={rise}
              className="text-xs uppercase tracking-[0.3em] mb-2"
              style={{ color: `${accent}cc`, fontFamily: "var(--font-sans)" }}
            >
              Schedule
            </motion.p>
            <motion.h2
              variants={rise}
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                color: "#ffffff",
                lineHeight: 1.2,
              }}
            >
              Event Details
            </motion.h2>
            <motion.div variants={rise} className="flex items-center justify-center gap-2 mt-3">
              <div className="h-0.5 w-8" style={{ background: `${accent}80` }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ background: accent }} />
              <div className="h-0.5 w-8" style={{ background: `${accent}80` }} />
            </motion.div>
          </div>

          {/* Horizontal scrolling cards */}
          <motion.div
            variants={cont}
            className="flex gap-5 overflow-x-auto pb-4 justify-start md:justify-center"
            style={{ scrollbarWidth: "none" }}
          >
            {events.map((ev, i) => (
              <EventCard key={i} {...ev} accent={accent} index={i} />
            ))}
          </motion.div>

          {/* View All */}
          <motion.div variants={rise} className="flex justify-center mt-10">
            <button
              className="px-7 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] transition-all hover:opacity-80"
              style={{ background: accent, color: "#ffffff", fontFamily: "var(--font-sans)" }}
            >
              View All
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
