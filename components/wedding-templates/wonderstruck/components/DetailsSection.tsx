"use client";

import { motion, type Variants } from "framer-motion";
import { Calendar, MapPin, Clock, GlassWater } from "lucide-react";
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

interface Card {
  icon: typeof Calendar;
  label: string;
  value?: string;
  time?: string;
  venue?: VenueView;
  note?: string;
}

export default function DetailsSection({ config, accent, gold, weddingDateFormatted }: Props) {
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const hashtag = hashtagOf(config);
  const dressCode = dressCodeOf(config);

  const hasCeremonyPlace = Boolean(ceremony.name || ceremony.address || ceremony.city);
  const cards: Card[] = [
    { icon: Calendar, label: "Date", value: weddingDateFormatted || "Date to be announced" },
    {
      icon: hasCeremonyPlace ? MapPin : Clock,
      label: "Ceremony",
      time: ceremony.time,
      venue: hasCeremonyPlace ? ceremony : undefined,
      note: receptionTime ? `Reception follows at ${receptionTime}` : undefined,
      value: hasCeremonyPlace || ceremony.time ? undefined : "Venue to be announced",
    },
  ];
  if (reception) cards.push({ icon: GlassWater, label: "Reception", time: reception.time, venue: reception });

  const linkClass = "uppercase tracking-widest text-xs underline underline-offset-4 decoration-1 transition-opacity hover:opacity-70";

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
          <p className="uppercase tracking-[0.25em] text-xs mb-3" style={{ color: `${accent}b0`, fontFamily: "var(--font-sans)" }}>
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
          className={`grid grid-cols-1 gap-6 ${cards.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {cards.map(({ icon: Icon, label, value, time, venue, note }) => (
            <motion.div
              key={label}
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
                <Icon size={20} style={{ color: gold }} aria-hidden />
              </div>

              <p
                className="uppercase tracking-widest text-xs mb-2"
                style={{ color: `${accent}b0`, fontFamily: "var(--font-sans)" }}
              >
                {label}
              </p>
              {value && (
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", color: "#f0ecf8", lineHeight: 1.5 }}>
                  {value}
                </p>
              )}
              {time && (
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: gold, lineHeight: 1.5 }}>
                  {time}
                </p>
              )}
              {venue && (
                <div className="mt-1" style={{ fontFamily: "var(--font-serif)", lineHeight: 1.5 }}>
                  {venue.name && <p style={{ fontSize: "1.05rem", color: "#f0ecf8" }}>{venue.name}</p>}
                  {(venue.address || venue.city) && (
                    <p className="text-sm" style={{ color: `${accent}cc`, fontFamily: "var(--font-sans)", letterSpacing: "0.04em" }}>
                      {[venue.address, venue.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}
              {note && (
                <p className="mt-2 text-sm italic" style={{ color: `${accent}cc`, fontFamily: "var(--font-serif)" }}>
                  {note}
                </p>
              )}
              {venue && (venue.mapUrl || venue.directionsUrl) && (
                <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1" style={{ fontFamily: "var(--font-sans)" }}>
                  {venue.mapUrl && (
                    <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: gold }}>
                      View map<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                  {venue.directionsUrl && (
                    <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: gold }}>
                      Get directions<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>

        {(dressCode || hashtag) && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
            className="mx-auto mt-16 flex max-w-2xl flex-col items-center gap-12 text-center"
          >
            {dressCode && (
              <div>
                <p className="uppercase tracking-[0.25em] text-xs mb-3" style={{ color: `${accent}b0`, fontFamily: "var(--font-sans)" }}>
                  Dress Code
                </p>
                {dressCode.title && (
                  <p className="mb-3" style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", color: "#f0ecf8" }}>
                    {dressCode.title}
                  </p>
                )}
                {dressCode.description && (
                  <p className="text-sm leading-relaxed" style={{ color: `${accent}cc` }}>
                    {dressCode.description}
                  </p>
                )}
                {dressCode.palette.length > 0 && (
                  <ul aria-label="Suggested colours" className="mt-6 flex flex-wrap items-center justify-center gap-4">
                    {dressCode.palette.map((hex) => (
                      <li key={hex}>
                        <span
                          className="block h-10 w-10 rounded-full"
                          style={{ background: hex, border: `1px solid ${gold}70`, boxShadow: `0 0 14px ${hex}55` }}
                        />
                        <span className="sr-only">{hex}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {hashtag && (
              <div>
                <p className="uppercase tracking-[0.25em] text-xs mb-3" style={{ color: `${accent}b0`, fontFamily: "var(--font-sans)" }}>
                  Share your moments
                </p>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: gold, textShadow: `0 0 18px ${gold}50` }}>
                  {hashtag}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
