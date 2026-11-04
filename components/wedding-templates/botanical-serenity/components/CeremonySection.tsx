"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Clock, Navigation } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import {
  ceremonyVenue,
  receptionVenue,
  receptionTimeAtCeremony,
  dressCodeOf,
  hashtagOf,
  type VenueView,
} from "@/lib/weddingDetails";
import BotanicalOrnament from "./BotanicalOrnament";

interface Props {
  config: WeddingConfig;
  green: string;
  floral: string;
  bg: string;
  textDeep: string;
}

export default function CeremonySection({ config, green, floral, bg, textDeep }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [40, 0]);

  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const dress = dressCodeOf(config);
  const hashtag = hashtagOf(config);

  const lines = (v: VenueView) => [v.name, v.address, v.city].filter(Boolean);
  const events: { label: string; time?: string; venue: string[]; note?: string; links?: VenueView }[] = [
    { label: "Ceremony", time: ceremony.time, venue: lines(ceremony), links: ceremony },
  ];
  if (reception) {
    events.push({ label: "Reception", time: reception.time, venue: lines(reception), links: reception });
  } else if (receptionTime) {
    events.push({ label: "Reception", time: receptionTime, venue: [], note: "At the ceremony venue" });
  }

  return (
    <section
      id="ceremony"
      ref={sectionRef}
      className="py-32"
      style={{ background: `${green}08` }}
    >
      <motion.div
        style={{ opacity, y }}
        className="max-w-3xl mx-auto px-8 text-center"
      >
        {/* Date — enormous typographic anchor */}
        <p
          className="text-[clamp(4rem,14vw,10rem)] leading-none font-thin select-none mb-2"
          style={{ color: `${green}22`, letterSpacing: "-0.04em" }}
          aria-hidden="true"
        >
          {config.weddingDate?.split(",")[0] ?? ""}
        </p>

        <BotanicalOrnament
          green={green}
          floral={floral}
          width={70}
          height={130}
          animationDelay={0}
          className="mx-auto -mt-8 mb-6"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
          className="text-xs tracking-[0.24em] uppercase mb-4"
          style={{ color: floral }}
        >
          Join us
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.3 }}
          className="text-3xl lg:text-4xl font-light mb-4"
          style={{ color: textDeep, letterSpacing: "-0.02em" }}
        >
          {config.weddingDate}
        </motion.h2>

        {config.venueName && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-base mb-16"
            style={{ color: `${textDeep}80` }}
          >
            {config.venueName}{config.venueCity ? `, ${config.venueCity}` : ""}
          </motion.p>
        )}

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: 0.5, background: `${green}30`, height: "1px", margin: "0 auto 64px", maxWidth: "160px" }}
        />

        {/* Event cards */}
        <div className={`grid grid-cols-1 gap-10 ${events.length > 1 ? "sm:grid-cols-2" : "max-w-sm mx-auto"}`}>
          {events.map((ev, i) => (
            <motion.div
              key={ev.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.4 + i * 0.15 }}
              className="text-left p-8 border"
              style={{ borderColor: `${green}22`, background: bg }}
            >
              <p
                className="text-[10px] tracking-[0.22em] uppercase mb-4"
                style={{ color: floral }}
              >
                {ev.label}
              </p>
              {ev.time && (
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={13} style={{ color: `${green}80` }} />
                  <span className="text-sm" style={{ color: textDeep }}>
                    {ev.time}
                  </span>
                </div>
              )}
              {ev.venue.length > 0 && (
                <div className="flex items-start gap-2">
                  <MapPin size={13} style={{ color: `${green}80`, marginTop: "3px", flexShrink: 0 }} />
                  <span className="text-sm leading-relaxed" style={{ color: `${textDeep}90` }}>
                    {ev.venue.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </span>
                </div>
              )}
              {ev.note && (
                <p className="text-sm leading-relaxed" style={{ color: `${textDeep}90` }}>{ev.note}</p>
              )}
              {ev.links && (ev.links.mapUrl || ev.links.directionsUrl) && (
                <div className="flex flex-wrap gap-x-5 mt-4">
                  {ev.links.mapUrl && (
                    <a href={ev.links.mapUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 py-1.5 text-xs tracking-wide underline underline-offset-4" style={{ color: green }}>
                      <MapPin size={12} aria-hidden /> View map
                    </a>
                  )}
                  {ev.links.directionsUrl && (
                    <a href={ev.links.directionsUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 py-1.5 text-xs tracking-wide underline underline-offset-4" style={{ color: green }}>
                      <Navigation size={12} aria-hidden /> Get directions
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {dress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.2 }}
            className="mt-16"
          >
            <p className="text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: floral }}>
              Dress code
            </p>
            {dress.title && (
              <p className="text-xl font-light mb-2" style={{ color: textDeep, letterSpacing: "-0.01em" }}>{dress.title}</p>
            )}
            {dress.description && (
              <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: `${textDeep}90` }}>{dress.description}</p>
            )}
            {dress.palette.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-3 mt-6" aria-label="Colour palette">
                {dress.palette.map((hex) => (
                  <li
                    key={hex}
                    role="img"
                    aria-label={`Palette colour ${hex}`}
                    className="w-8 h-8 rounded-full"
                    style={{ background: hex, border: `1px solid ${green}30` }}
                  />
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {hashtag && (
          <p className="mt-16 text-lg font-light italic" style={{ color: green, letterSpacing: "0.02em" }}>
            {hashtag}
          </p>
        )}
      </motion.div>
    </section>
  );
}
