import { MapPin } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SANS, mapsUrl } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
  /** Show the travel notes as "Good to know before you go". */
  showNotes: boolean;
}

/** Arched card for the venue, like a window onto the place, with arrival notes beneath. */
export default function VenueSection({ config, palette: p, band, showNotes }: Props) {
  const t = tones(band, p);
  const address = [config.venueAddress, config.venueCity].filter(Boolean).join(", ");
  const maps = mapsUrl(config);
  const notes = showNotes
    ? [config.travel?.directions, config.travel?.accommodations, config.travel?.notes]
        .flatMap((block) => block?.split("\n") ?? [])
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
    : [];
  if (!config.venueName && !address && notes.length === 0) return null;

  return (
    <section id="venue" aria-labelledby="ah-venue-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <SectionTitle id="ah-venue-title" eyebrow="Where the sun sets" title="The place" band={band} palette={p} />

        {(config.venueName || address) && (
          <div
            style={{
              background: t.card,
              color: p.ink,
              borderRadius: "999px 999px 1.5rem 1.5rem",
              padding: "clamp(4rem, 16vw, 5.5rem) clamp(1.5rem, 6vw, 2.5rem) 2.25rem",
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.apricot} 35%, transparent), 0 20px 40px -28px ${p.dusk}`,
            }}
          >
            <MapPin aria-hidden size={22} style={{ color: p.apricot, margin: "0 auto 0.75rem" }} />
            {config.venueName && (
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.8rem, 7.5vw, 2.4rem)", lineHeight: 1.12, margin: 0, textWrap: "balance" }}>{config.venueName}</h3>
            )}
            {address && <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: "1.05rem", lineHeight: 1.6, color: `color-mix(in srgb, ${p.ink} 75%, transparent)`, margin: "0.6rem 0 0" }}>{address}</p>}
            {maps && (
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 48,
                  marginTop: "1.75rem",
                  padding: "0 1.6rem",
                  borderRadius: 999,
                  background: p.apricot,
                  color: "#fff",
                  fontFamily: SANS,
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textDecoration: "none",
                  outlineColor: p.dusk,
                }}
              >
                Map the way
              </a>
            )}
          </div>
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
