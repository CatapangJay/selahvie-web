"use client";

import { motion, type Variants } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import {
  ceremonyVenue,
  receptionVenue,
  receptionTimeAtCeremony,
  dressCodeOf,
  type VenueView,
} from "@/lib/weddingDetails";
import BotanicalCorner from "./BotanicalCorner";
import GoldPillButton from "./GoldPillButton";

interface Props {
  config: WeddingConfig;
  gold: string;
  accent: string;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};
const cont: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const cardStyle = (gold: string): React.CSSProperties => ({
  background: "rgba(20,30,22,0.55)",
  backdropFilter: "blur(10px)",
  border: `1px solid ${gold}20`,
});

function VenueCard({ eyebrow, venue, note, gold }: { eyebrow: string; venue: VenueView; note?: string; gold: string }) {
  const hasVenue = !!(venue.name || venue.address || venue.city);
  return (
    <motion.div variants={rise} className="rounded-2xl px-8 py-7 mb-6" style={cardStyle(gold)}>
      <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}>
        {eyebrow}
      </p>
      {hasVenue ? (
        <>
          {venue.name && (
            <p className="mb-2" style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", color: "#ffffff" }}>
              {venue.name}
            </p>
          )}
          {venue.address && (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{venue.address}</p>
          )}
          {venue.city && (
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{venue.city}</p>
          )}
          {(venue.time || note) && (
            <p className="text-sm mt-3" style={{ color: gold, fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
              {[venue.time, note].filter(Boolean).join(" · ")}
            </p>
          )}
          {(venue.mapUrl || venue.directionsUrl) && (
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              {venue.mapUrl && (
                <GoldPillButton gold={gold} href={venue.mapUrl}>
                  <MapPin size={13} />
                  View Location
                </GoldPillButton>
              )}
              {venue.directionsUrl && (
                <GoldPillButton gold={gold} href={venue.directionsUrl} outline>
                  <Navigation size={13} />
                  Get directions
                </GoldPillButton>
              )}
            </div>
          )}
        </>
      ) : (
        <p style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>Venue to be announced</p>
      )}
    </motion.div>
  );
}

export default function LocationSection({ config, gold }: Props) {
  const BG = "#243028";
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const dress = dressCodeOf(config);

  return (
    <section
      className="relative overflow-hidden py-20 px-6 text-center"
      style={{ background: BG, borderTop: `1px solid ${gold}15` }}
    >
      {/* Corner botanicals */}
      <div className="absolute top-0 right-0 z-0"><BotanicalCorner corner="top-right" scale={0.85} opacity={0.7} /></div>
      <div className="absolute bottom-0 left-0  z-0"><BotanicalCorner corner="bottom-left" scale={0.8} opacity={0.7} /></div>

      <motion.div
        variants={cont}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="relative max-w-md mx-auto text-center"
        style={{ zIndex: 1 }}
      >
        {/* Floating pin icon */}
        <motion.div
          variants={rise}
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{ background: `${gold}18`, border: `1px solid ${gold}35` }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <MapPin size={20} style={{ color: gold }} />
        </motion.div>

        <motion.h2
          variants={rise}
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: "1.5rem",
          }}
        >
          The Location
        </motion.h2>

        <VenueCard eyebrow="The Ceremony" venue={ceremony} gold={gold} />

        {reception ? (
          <VenueCard eyebrow="The Reception" venue={reception} gold={gold} />
        ) : receptionTime ? (
          <motion.p variants={rise} className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
            Reception at {receptionTime}, at the same venue
          </motion.p>
        ) : null}

        {dress && (
          <motion.div variants={rise} className="rounded-2xl px-8 py-7" style={cardStyle(gold)}>
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}>
              Dress Code
            </p>
            {dress.title && (
              <p className="mb-2" style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", color: "#ffffff" }}>{dress.title}</p>
            )}
            {dress.description && (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{dress.description}</p>
            )}
            {dress.palette.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-3 mt-4" aria-label="Colour palette">
                {dress.palette.map((hex) => (
                  <li
                    key={hex}
                    role="img"
                    aria-label={`Palette colour ${hex}`}
                    className="w-7 h-7 rounded-full"
                    style={{ background: hex, border: `1px solid ${gold}60` }}
                  />
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
