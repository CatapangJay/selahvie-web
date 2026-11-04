import { MapPin, Wine } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import { ceremonyVenue, dressCodeOf, hashtagOf, receptionTimeAtCeremony, receptionVenue, type VenueView } from "@/lib/weddingDetails";
import type { CSSProperties, ReactNode } from "react";
import type { Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
  /** Show the travel notes as "Good to know before you go". */
  showNotes: boolean;
}

const PILL = "transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4";

/** One window onto a place: when, name, address and the map links. */
function PlaceCard({ p, t, venue, time, label, arch, icon }: { p: Palette; t: ReturnType<typeof tones>; venue: VenueView; time: string; label: string; arch: boolean; icon: ReactNode }) {
  const address = [venue.address, venue.city].filter(Boolean).join(", ");
  const pill = (filled: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    minHeight: 48,
    padding: "0 1.5rem",
    borderRadius: 999,
    background: filled ? p.apricot : "transparent",
    border: `1.5px solid ${p.apricot}`,
    color: filled ? "#fff" : p.apricotDeep,
    fontFamily: SANS,
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textDecoration: "none",
    outlineColor: p.dusk,
  });
  return (
    <div
      style={{
        background: t.card,
        color: p.ink,
        borderRadius: arch ? "999px 999px 1.5rem 1.5rem" : "1.75rem",
        padding: arch ? "clamp(4rem, 16vw, 5.5rem) clamp(1.5rem, 6vw, 2.5rem) 2.25rem" : "2.25rem clamp(1.5rem, 6vw, 2.5rem)",
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.apricot} 35%, transparent), 0 20px 40px -28px ${p.dusk}`,
      }}
    >
      <span aria-hidden style={{ color: p.apricot, display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>{icon}</span>
      <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase", color: p.apricotDeep, margin: "0 0 0.6rem" }}>
        {label}
        {time && ` · ${time}`}
      </p>
      {venue.name && <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.8rem, 7.5vw, 2.4rem)", lineHeight: 1.12, margin: 0, textWrap: "balance" }}>{venue.name}</h3>}
      {address && <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: "1.05rem", lineHeight: 1.6, color: `color-mix(in srgb, ${p.ink} 75%, transparent)`, margin: "0.6rem 0 0" }}>{address}</p>}
      {(venue.mapUrl || venue.directionsUrl) && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", marginTop: "1.75rem" }}>
          {venue.mapUrl && (
            <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className={PILL} style={pill(true)}>
              Map the way
            </a>
          )}
          {venue.directionsUrl && (
            <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className={PILL} style={pill(false)}>
              Get directions
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** Arched card for the venue, like a window onto the place, then reception, dress code and arrival notes. */
export default function VenueSection({ config, palette: p, band, showNotes }: Props) {
  const t = tones(band, p);
  const ceremony = ceremonyVenue(config);
  const hasCeremony = Boolean(ceremony.name || ceremony.address || ceremony.city);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const dress = dressCodeOf(config);
  const hashtag = hashtagOf(config);
  const notes = showNotes
    ? [config.travel?.directions, config.travel?.accommodations, config.travel?.notes]
        .flatMap((block) => block?.split("\n") ?? [])
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
    : [];
  if (!hasCeremony && notes.length === 0 && !dress && !hashtag) return null;

  return (
    <section id="venue" aria-labelledby="ah-venue-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <SectionTitle id="ah-venue-title" eyebrow="Where the sun sets" title="The place" band={band} palette={p} />

        {hasCeremony && <PlaceCard p={p} t={t} venue={ceremony} time={ceremony.time} label="The ceremony" arch icon={<MapPin size={22} />} />}
        {reception && (
          <div style={{ marginTop: "1.25rem" }}>
            <PlaceCard p={p} t={t} venue={reception} time={reception.time} label="The reception" arch={false} icon={<Wine size={22} />} />
          </div>
        )}
        {!reception && receptionTime && (
          <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.25rem", color: t.text, margin: "1.5rem 0 0" }}>
            The reception follows at {receptionTime}, right here.
          </p>
        )}

        {dress && (
          <div style={{ marginTop: "3rem", background: t.card, borderRadius: "1.75rem", padding: "2rem 1.5rem", boxShadow: band.dark ? `inset 0 0 0 1px ${t.rule}` : undefined, color: band.dark ? p.morning : p.ink }}>
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase", color: band.dark ? p.butter : p.apricotDeep, margin: "0 0 0.5rem" }}>What to wear</p>
            {dress.title && <h3 style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 400, fontSize: "1.7rem", margin: 0 }}>{dress.title}</h3>}
            {dress.description && <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: "1.05rem", lineHeight: 1.6, margin: "0.5rem auto 0", maxWidth: 420 }}>{dress.description}</p>}
            {dress.palette.length > 0 && (
              <ul aria-label="Suggested colour palette" style={{ listStyle: "none", padding: 0, margin: "1.25rem 0 0", display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                {dress.palette.map((hex) => (
                  <li key={hex} role="img" aria-label={`Palette colour ${hex}`} title={hex} style={{ width: 36, height: 36, borderRadius: "50%", background: hex, boxShadow: `0 0 0 3px ${band.dark ? "rgba(255,246,236,.5)" : p.morning}, 0 0 0 4px ${t.rule}` }} />
                ))}
              </ul>
            )}
          </div>
        )}

        {hashtag && (
          <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(1.8rem, 7vw, 2.4rem)", color: t.text, margin: "2.5rem 0 0" }}>{hashtag}</p>
        )}

        {notes.length > 0 && (
          <div style={{ marginTop: "3rem", textAlign: "left" }}>
            <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.4rem", color: t.text, margin: "0 0 0.75rem", textAlign: "center" }}>Good to know before you go</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notes.map((note, i) => (
                <li key={i} style={{ display: "flex", gap: "0.85rem", alignItems: "baseline", padding: "0.9rem 0", borderBottom: `1px dashed ${t.rule}` }}>
                  <span aria-hidden style={{ flexShrink: 0, width: 9, height: 9, borderRadius: "50%", background: p.apricot, transform: "translateY(-1px)" }} />
                  <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: "1.05rem", lineHeight: 1.6, color: t.text }}>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
