"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, GlassWater } from "lucide-react";
import SectionLabel from "./SectionLabel";
import {
  ceremonyVenue,
  receptionVenue,
  receptionTimeAtCeremony,
  hashtagOf,
  dressCodeOf,
  type VenueView,
} from "@/lib/weddingDetails";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
  weddingDateFormatted: string;
}

export default function DetailsSection({ config, accent, weddingDateFormatted }: Props) {
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const hashtag = hashtagOf(config);
  const dressCode = dressCodeOf(config);

  const hasCeremonyPlace = Boolean(ceremony.name || ceremony.address || ceremony.city);
  const cards: {
    icon: typeof Calendar;
    label: string;
    value?: string;
    time?: string;
    venue?: VenueView;
    note?: string;
  }[] = [
    { icon: Calendar, label: "Date", value: weddingDateFormatted || "TBD" },
    {
      icon: hasCeremonyPlace ? MapPin : Clock,
      label: "Ceremony",
      time: ceremony.time,
      venue: hasCeremonyPlace ? ceremony : undefined,
      note: receptionTime ? `Reception follows at ${receptionTime}` : undefined,
      value: hasCeremonyPlace || ceremony.time ? undefined : "TBD",
    },
  ];
  if (reception) cards.push({ icon: GlassWater, label: "Reception", time: reception.time, venue: reception });

  const linkClass = "label-luxury underline underline-offset-4 decoration-1 transition-opacity hover:opacity-70";

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

        <div className={`grid grid-cols-1 gap-6 ${cards.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {cards.map(({ icon: Icon, label, value, time, venue, note }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-4 p-10 text-center relative group"
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
                <Icon size={22} style={{ color: accent }} aria-hidden />
              </div>
              <p className="label-luxury" style={{ color: `${accent}b0`, letterSpacing: "0.18em" }}>
                {label}
              </p>
              {value && (
                <p className="text-sm font-light leading-snug" style={{ color: "rgba(245,240,232,0.75)" }}>
                  {value}
                </p>
              )}
              {time && (
                <p
                  className="text-lg leading-snug"
                  style={{ fontFamily: "var(--font-serif)", color: accent }}
                >
                  {time}
                </p>
              )}
              {venue && (
                <div className="text-sm font-light leading-snug" style={{ color: "rgba(245,240,232,0.75)" }}>
                  {venue.name && <p style={{ color: "#f5f0e8" }}>{venue.name}</p>}
                  {(venue.address || venue.city) && (
                    <p style={{ color: "rgba(245,240,232,0.6)" }}>
                      {[venue.address, venue.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}
              {note && (
                <p className="text-xs font-light italic" style={{ color: "rgba(245,240,232,0.6)" }}>
                  {note}
                </p>
              )}
              {venue && (venue.mapUrl || venue.directionsUrl) && (
                <p
                  className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1"
                  style={{ fontSize: "0.65rem", letterSpacing: "0.16em" }}
                >
                  {venue.mapUrl && (
                    <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: accent }}>
                      View map<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                  {venue.directionsUrl && (
                    <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: accent }}>
                      Get directions<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {(hashtag || dressCode) && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto mt-16 flex max-w-2xl flex-col items-center gap-12 text-center"
          >
            {dressCode && (
              <div>
                <p className="label-luxury mb-3" style={{ color: `${accent}b0`, letterSpacing: "0.22em" }}>
                  Dress Code
                </p>
                {dressCode.title && (
                  <p className="headline-sm mb-3" style={{ fontFamily: "var(--font-serif)", color: "#f5f0e8" }}>
                    {dressCode.title}
                  </p>
                )}
                {dressCode.description && (
                  <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
                    {dressCode.description}
                  </p>
                )}
                {dressCode.palette.length > 0 && (
                  <ul aria-label="Suggested colours" className="mt-6 flex flex-wrap items-center justify-center gap-4">
                    {dressCode.palette.map((hex) => (
                      <li key={hex}>
                        {/* Square tile with a gold keyline, like a swatch card */}
                        <span
                          className="block h-10 w-10"
                          style={{ background: hex, border: `1px solid ${accent}70`, outline: `1px solid ${accent}25`, outlineOffset: "3px" }}
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
                <p className="label-luxury mb-3" style={{ color: `${accent}b0`, letterSpacing: "0.22em" }}>
                  Share the evening
                </p>
                <p className="text-2xl" style={{ fontFamily: "var(--font-serif)", color: accent }}>
                  {hashtag}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${accent}25, transparent)` }}
      />
    </section>
  );
}
