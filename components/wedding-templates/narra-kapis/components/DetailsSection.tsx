import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { ceremonyVenue, dressCodeOf, hashtagOf, receptionTimeAtCeremony, receptionVenue, type VenueView } from "@/lib/weddingDetails";
import { DISPLAY, SERIF, capizStyle, woodStyle } from "../theme";
import { Brackets } from "./Ornaments";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** Travel notes are their own audience section; hide them when it is off. */
  showNotes: boolean;
}


const LINK_CLASS = "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/** One venue on the plaque: role in engraved caps, name, address, time and the two map links. */
function VenueBlock({ role, venue, extraTime, palette: p, first }: { role: string; venue: VenueView; extraTime?: string; palette: Palette; first?: boolean }) {
  const time = venue.time || extraTime || "";
  const address = [venue.address, venue.city].filter(Boolean).join(", ");
  if (!venue.name && !address && !time) return null;
  const link = (filled: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 1.5rem",
    background: filled ? p.narra : "transparent",
    color: filled ? p.capiz : p.narraDeep,
    border: `1px solid ${filled ? p.narra : p.brass}`,
    fontFamily: DISPLAY,
    fontSize: 13,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    textDecoration: "none",
    outlineColor: p.narraDeep,
  });
  return (
    <div style={{ marginTop: first ? "0.85rem" : "2.25rem", paddingTop: first ? 0 : "2rem", borderTop: first ? "none" : `1px solid color-mix(in srgb, ${p.brass} 55%, transparent)` }}>
      <p style={{ fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.26em", paddingLeft: "0.26em", textTransform: "uppercase", color: p.molave, margin: 0 }}>{role}</p>
      {time && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(18px, 4.8vw, 21px)", color: p.ink, margin: "0.4rem 0 0" }}>{time}</p>}
      {venue.name && (
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7.6vw, 38px)", letterSpacing: "0.06em", lineHeight: 1.15, color: p.narraDeep, margin: "0.6rem 0 0" }}>
          {venue.name}
        </h3>
      )}
      {address && (
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.5, color: p.ink, margin: "0.6rem 0 0" }}>{address}</p>
      )}
      {(venue.mapUrl || venue.directionsUrl) && (
        <div className="flex flex-wrap justify-center gap-3" style={{ marginTop: "1.25rem" }}>
          {venue.mapUrl && (
            <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS} style={link(true)}>
              Tingnan sa mapa<span className="sr-only"> ({venue.name || role})</span>
            </a>
          )}
          {venue.directionsUrl && (
            <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className={LINK_CLASS} style={link(false)}>
              Get directions<span className="sr-only"> to {venue.name || role}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** Venue card set like a pearl capiz plaque on a narra wall, with arrival reminders below. */
export default function DetailsSection({ config, palette: p, date, showNotes }: Props) {
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const hashtag = hashtagOf(config);
  const dress = dressCodeOf(config);
  const t = config.travel;
  const notes = showNotes
    ? [t?.directions, t?.accommodations, ...(t?.notes?.split("\n") ?? [])].map((s) => s?.trim()).filter((s): s is string => Boolean(s))
    : [];
  const hasVenue = Boolean(config.venueName || config.venueAddress || config.venueCity || ceremony.time);
  if (!hasVenue && !dress && notes.length === 0) return null;

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
            <VenueBlock role="Ang seremonya" venue={ceremony} first palette={p} />
            {reception ? (
              <VenueBlock role="Ang handaan" venue={reception} palette={p} />
            ) : (
              receptionTime && (
                <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 19px)", color: p.ink, margin: "1.5rem 0 0" }}>
                  Handaan to follow at {receptionTime}
                </p>
              )
            )}
            {hashtag && (
              <p style={{ fontFamily: DISPLAY, fontSize: 15, letterSpacing: "0.14em", color: p.narra, margin: "2rem 0 0" }}>{hashtag}</p>
            )}
          </div>
        )}

        {dress && (
          <div style={{ marginTop: hasVenue ? "3.5rem" : 0 }}>
            <p style={{ fontFamily: DISPLAY, fontSize: 14, letterSpacing: "0.26em", paddingLeft: "0.26em", textTransform: "uppercase", color: p.brass, margin: "0 0 0.75rem" }}>Kasuotan</p>
            {dress.title && <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(22px, 6vw, 28px)", letterSpacing: "0.06em", color: p.capiz, margin: 0 }}>{dress.title}</h3>}
            {dress.description && <p style={{ fontFamily: SERIF, fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.6, color: p.capiz, margin: "0.6rem 0 0" }}>{dress.description}</p>}
            {dress.palette.length > 0 && (
              <ul aria-label="Suggested colors" className="flex flex-wrap justify-center gap-3" style={{ listStyle: "none", padding: 0, margin: "1.25rem 0 0" }}>
                {dress.palette.map((hex) => (
                  <li key={hex} role="img" aria-label={`Color ${hex.toUpperCase()}`} style={{ width: 40, height: 40, borderRadius: "50%", background: hex, boxShadow: `0 0 0 2px ${p.narraDeep}, 0 0 0 3px ${p.brass}` }} />
                ))}
              </ul>
            )}
          </div>
        )}

        {notes.length > 0 && (
          <div style={{ marginTop: hasVenue || dress ? "3.5rem" : 0 }}>
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
