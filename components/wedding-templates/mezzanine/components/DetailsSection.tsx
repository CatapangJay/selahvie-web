import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { ceremonyVenue, hashtagOf, receptionTimeAtCeremony, receptionVenue, type VenueView } from "@/lib/weddingDetails";
import type { DateParts, Palette } from "../theme";
import { BODY, DISPLAY, SANS } from "../theme";
import { Floor, FloorHeading } from "./Motion";

/** One venue: the time set large on the left, the place and its links on the right. */
function Venue({ title, venue, palette: p, fallbackTime }: { title: string; venue: VenueView; palette: Palette; fallbackTime?: string }) {
  const time = venue.time || fallbackTime || "";
  const link: CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: 44, minWidth: 44, fontFamily: SANS, fontWeight: 600, fontSize: 15, color: p.oxblood, textDecoration: "underline", textUnderlineOffset: 5, textDecorationColor: `color-mix(in srgb, ${p.bronze} 70%, transparent)`, outlineColor: p.oxblood };
  return (
    <article style={{ display: "grid", gridTemplateColumns: time ? "auto minmax(0, 1fr)" : "1fr", gap: "0.4rem clamp(1rem, 5cqw, 1.8rem)", padding: "1.6rem 0", borderTop: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)` }}>
      {time && (
        <p style={{ fontFamily: DISPLAY, fontSize: "clamp(1.45rem, 6.6cqw, 2.2rem)", lineHeight: 1.05, color: p.bronzeText, margin: 0, whiteSpace: time.length <= 8 ? "nowrap" : "normal", maxWidth: "9ch", fontVariantNumeric: "lining-nums" }}>{time}</p>
      )}
      <div style={{ minWidth: 0 }}>
        <h3 style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: p.inkSoft, margin: 0 }}>{title}</h3>
        {venue.name && <p style={{ fontFamily: DISPLAY, fontSize: "clamp(1.35rem, 6cqw, 1.75rem)", lineHeight: 1.15, color: p.ink, margin: "0.35rem 0 0" }}>{venue.name}</p>}
        {(venue.address || venue.city) && (
          <p style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.55, color: p.inkSoft, margin: "0.45rem 0 0" }}>{[venue.address, venue.city].filter(Boolean).join(", ")}</p>
        )}
        {(venue.mapUrl || venue.directionsUrl) && (
          <p className="flex flex-wrap" style={{ gap: "0 1.4rem", margin: "0.4rem 0 0" }}>
            {venue.mapUrl && (
              <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className="focus-visible:outline-2 focus-visible:outline-offset-2" style={link}>
                Map<span className="sr-only"> of {venue.name || title} (opens in a new tab)</span>
              </a>
            )}
            {venue.directionsUrl && (
              <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className="focus-visible:outline-2 focus-visible:outline-offset-2" style={link}>
                Directions<span className="sr-only"> to {venue.name || title} (opens in a new tab)</span>
              </a>
            )}
          </p>
        )}
      </div>
    </article>
  );
}

/** Where and when, one venue after the other, closing on the hashtag. */
export default function DetailsSection({ config, floor, palette: p, date }: { config: WeddingConfig; floor: number; palette: Palette; date: DateParts }) {
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const hashtag = hashtagOf(config);

  return (
    <Floor id="details" labelledBy="mz-details-title" background={p.linen}>
      <FloorHeading id="mz-details-title" floor={floor} title="Where & when" lede={date.long || undefined} palette={p} />
      <Venue title="The ceremony" venue={ceremony} palette={p} />
      {reception && <Venue title="The reception" venue={reception} palette={p} />}
      {!reception && receptionTime && (
        <p style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.6, color: p.inkSoft, margin: 0, padding: "1.2rem 0 0", borderTop: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)` }}>
          The reception follows at {receptionTime}, in the same place.
        </p>
      )}
      {hashtag && (
        <p style={{ fontFamily: SANS, fontSize: 15, color: p.inkSoft, margin: 0, padding: "1.4rem 0 0", borderTop: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)` }}>
          Sharing photos? Tag them{" "}
          <span style={{ display: "block", fontFamily: DISPLAY, fontSize: "clamp(1.2rem, 5cqw, 1.45rem)", color: p.oxblood, marginTop: "0.25rem", overflowWrap: "anywhere" }}>{hashtag}</span>
        </p>
      )}
    </Floor>
  );
}
