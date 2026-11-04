"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Calendar, Clock, MapPin, Navigation, Shirt } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import {
  ceremonyVenue,
  receptionVenue,
  receptionTimeAtCeremony,
  dressCodeOf,
  hashtagOf,
  type VenueView,
} from "@/lib/weddingDetails";

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
  date?: string;
  time?: string;
  venue?: string[];
  note?: string;
  dress?: { title: string; description: string; palette: string[] };
  links?: VenueView;
  accent: string;
}

function EventCard({ title, subtitle, date, time, venue, note, dress, links, accent }: EventCardProps) {
  const rowText = { color: "rgba(44,24,16,0.75)", fontFamily: "var(--font-sans)" };
  const linkClass = "inline-flex items-center gap-1.5 py-1.5 text-xs underline underline-offset-4";
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
      className="flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: "240px",
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
            style={{ color: "#8a4a14", fontFamily: "var(--font-sans)" }}
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
          {date && (
            <div className="flex items-start gap-2">
              <Calendar size={12} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
              <span className="text-xs" style={rowText}>{date}</span>
            </div>
          )}
          {time && (
            <div className="flex items-start gap-2">
              <Clock size={12} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
              <span className="text-xs" style={rowText}>{time}</span>
            </div>
          )}
          {venue && venue.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPin size={12} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
              <span className="text-xs" style={{ ...rowText, lineHeight: 1.6 }}>
                {venue.map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </span>
            </div>
          )}
          {note && <p className="text-xs italic" style={rowText}>{note}</p>}
          {dress && (
            <div className="flex items-start gap-2">
              <Shirt size={12} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
              <div className="flex flex-col gap-2">
                {dress.description && <span className="text-xs" style={{ ...rowText, lineHeight: 1.6 }}>{dress.description}</span>}
                {dress.palette.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5" aria-label="Colour palette">
                    {dress.palette.map((hex) => (
                      <li
                        key={hex}
                        role="img"
                        aria-label={`Palette colour ${hex}`}
                        className="w-5 h-5 rounded-full"
                        style={{ background: hex, border: "1px solid rgba(44,24,16,0.2)" }}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {links && (links.mapUrl || links.directionsUrl) && (
          <div className="flex flex-wrap gap-x-4" style={{ color: "#8a4a14", fontFamily: "var(--font-sans)" }}>
            {links.mapUrl && (
              <a href={links.mapUrl} target="_blank" rel="noopener" className={linkClass}>
                <MapPin size={11} aria-hidden /> View map
              </a>
            )}
            {links.directionsUrl && (
              <a href={links.directionsUrl} target="_blank" rel="noopener" className={linkClass}>
                <Navigation size={11} aria-hidden /> Get directions
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function buildEvents(config: WeddingConfig): Omit<EventCardProps, "accent">[] {
  const date = config.weddingDate
    ? new Date(config.weddingDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : undefined;
  const lines = (v: VenueView) => [v.name, v.address, v.city].filter(Boolean);
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const dress = dressCodeOf(config);

  const events: Omit<EventCardProps, "accent">[] = [
    { title: "Wedding Ceremony", subtitle: "Ceremony", date, time: ceremony.time || undefined, venue: lines(ceremony), links: ceremony },
  ];
  if (reception) {
    events.push({ title: "Reception", subtitle: "Celebration", date, time: reception.time || undefined, venue: lines(reception), links: reception });
  } else if (receptionTime) {
    events.push({ title: "Reception", subtitle: "Celebration", date, time: receptionTime, note: "At the ceremony venue" });
  }
  if (dress) {
    events.push({ title: dress.title || "Dress Code", subtitle: "Attire", dress });
  }
  return events;
}

export default function EventDetailsSection({ config, accent }: Props) {
  const events = buildEvents(config);
  const hashtag = hashtagOf(config);
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
              <EventCard key={i} {...ev} accent={accent} />
            ))}
          </motion.div>

          {hashtag && (
            <motion.p
              variants={rise}
              className="text-center mt-10"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.4rem", color: "#ffffff" }}
            >
              {hashtag}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
