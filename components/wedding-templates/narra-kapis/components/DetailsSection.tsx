import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SERIF, capizStyle, mapsUrl, woodStyle } from "../theme";
import { Brackets } from "./Ornaments";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** Travel notes are their own audience section; hide them when it is off. */
  showNotes: boolean;
}

/** Venue card set like a pearl capiz plaque on a narra wall, with arrival reminders below. */
export default function DetailsSection({ config, palette: p, date, showNotes }: Props) {
  const maps = mapsUrl(config);
  const t = config.travel;
  const notes = showNotes
    ? [t?.directions, t?.accommodations, ...(t?.notes?.split("\n") ?? [])].map((s) => s?.trim()).filter((s): s is string => Boolean(s))
    : [];
  const hasVenue = Boolean(config.venueName || config.venueAddress || config.venueCity);
  if (!hasVenue && notes.length === 0) return null;

  return (
    <section id="details" aria-labelledby="nk-details-title" style={{ ...woodStyle(p), padding: "6rem 1.25rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <SectionHeading id="nk-details-title" eyebrow="Kailan at saan" title="The Day" color={p.capiz} accent={p.brass} />

        {hasVenue && (
          <div style={{ ...capizStyle(p, 96), position: "relative", color: p.ink, padding: "2.75rem 1.5rem 2.25rem", boxShadow: `0 0 0 6px ${p.narraDeep}, 0 0 0 7px ${p.brass}, 0 24px 40px -24px rgba(0,0,0,.8)` }}>
            <Brackets color={p.brass} />
            {date.long && (
              <p style={{ fontFamily: DISPLAY, fontSize: 13, letterSpacing: "0.24em", paddingLeft: "0.24em", textTransform: "uppercase", color: p.molave, margin: 0 }}>{date.long}</p>
            )}
            {config.venueName && (
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7.6vw, 38px)", letterSpacing: "0.06em", lineHeight: 1.15, color: p.narraDeep, margin: "0.85rem 0 0" }}>
                {config.venueName}
              </h3>
            )}
            {(config.venueAddress || config.venueCity) && (
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.5, color: p.ink, margin: "0.6rem 0 0" }}>
                {[config.venueAddress, config.venueCity].filter(Boolean).join(", ")}
              </p>
            )}
            {maps && (
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 48,
                  marginTop: "1.5rem",
                  padding: "0 1.5rem",
                  background: p.narra,
                  color: p.capiz,
                  fontFamily: DISPLAY,
                  fontSize: 13,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  outlineColor: p.narraDeep,
                }}
              >
                Tingnan sa mapa
              </a>
            )}
          </div>
        )}

        {notes.length > 0 && (
          <div style={{ marginTop: hasVenue ? "3.5rem" : 0 }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 14, letterSpacing: "0.26em", paddingLeft: "0.26em", textTransform: "uppercase", color: p.brass, margin: "0 0 1rem" }}>Mga paalala</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notes.map((note, i) => (
                <li
                  key={i}
                  style={{ fontFamily: SERIF, fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.6, color: p.capiz, padding: "1.1rem 0.5rem", borderTop: i === 0 ? "none" : `1px solid color-mix(in srgb, ${p.brass} 45%, transparent)` }}
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
