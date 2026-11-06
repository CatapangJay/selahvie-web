import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import { ceremonyVenue, hashtagOf, receptionTimeAtCeremony, receptionVenue, type VenueView } from "@/lib/weddingDetails";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, SANS, labelText, paperStyle, sheetStyle } from "../theme";
import { SHEET_PAD, SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** Travel notes are their own audience section. */
  showTravel: boolean;
}

/** One locality label: a bordered specimen label with typed rows and map links underneath. */
function LocalityLabel({ title, venue, date, palette: p, note }: { title: string; venue: VenueView; date: DateParts; palette: Palette; note?: string }) {
  const rows = [
    venue.address || venue.city ? ["Address", [venue.address, venue.city].filter(Boolean).join(", ")] : null,
    date.long ? ["Date", date.long] : null,
    venue.time ? ["Time", venue.time] : note ? ["Time", note] : null,
  ].filter((r): r is string[] => Boolean(r));
  const linkStyle: CSSProperties = { fontFamily: MONO, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: p.ink, textDecoration: "underline", textUnderlineOffset: 5, textDecorationColor: p.rust, outlineColor: p.ink, display: "inline-flex", alignItems: "center", minHeight: 44 };
  return (
    <article style={{ ...sheetStyle(p), padding: "1.4rem 1.25rem 1rem", border: `1px solid color-mix(in srgb, ${p.ink} 38%, transparent)` }}>
      <p style={{ ...labelText(p, 10), color: p.rust, margin: 0 }}>{title}</p>
      {venue.name && <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.5rem, 6.4cqw, 1.9rem)", lineHeight: 1.15, color: p.ink, margin: "0.4rem 0 0" }}>{venue.name}</h3>}
      {rows.length > 0 && (
        <dl style={{ margin: "0.9rem 0 0" }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: "0.8rem", padding: "0.5rem 0", borderTop: `1px solid color-mix(in srgb, ${p.ink} 20%, transparent)` }}>
              <dt style={{ ...labelText(p, 10), flex: "0 0 4.4rem", paddingTop: 3 }}>{k}</dt>
              <dd style={{ fontFamily: MONO, fontSize: 14, lineHeight: 1.5, color: p.text, margin: 0 }}>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {(venue.mapUrl || venue.directionsUrl) && (
        <div className="flex flex-wrap gap-x-6" style={{ marginTop: "0.4rem", borderTop: `1px solid color-mix(in srgb, ${p.ink} 20%, transparent)` }}>
          {venue.mapUrl && (
            <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className="focus-visible:outline-2 focus-visible:outline-offset-2" style={linkStyle}>
              Open map<span className="sr-only"> of {venue.name || title} (opens in a new tab)</span>
            </a>
          )}
          {venue.directionsUrl && (
            <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className="focus-visible:outline-2 focus-visible:outline-offset-2" style={linkStyle}>
              Directions<span className="sr-only"> to {venue.name || title} (opens in a new tab)</span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}

/** Where and when: one label per venue, the hashtag, and travel written as numbered field notes. */
export default function DetailsSection({ config, palette: p, date, showTravel }: Props) {
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const hashtag = hashtagOf(config);
  const t = config.travel;
  const notes = showTravel
    ? [t?.directions, t?.accommodations, ...(t?.notes?.split("\n") ?? [])].map((s) => s?.trim()).filter((s): s is string => Boolean(s))
    : [];
  const hasVenue = Boolean(ceremony.name || ceremony.address || ceremony.city || ceremony.time);
  if (!hasVenue && !hashtag && notes.length === 0) return null;

  return (
    <section id="details" aria-labelledby="ef-details-title" style={{ ...paperStyle(p), padding: SHEET_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="ef-details-title" caption="Locality" title="Where to find us" ink={p.ink} soft={p.inkSoft} rust={p.rust} />
        {hasVenue && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <LocalityLabel title="The ceremony" venue={ceremony} date={date} palette={p} />
            {reception && <LocalityLabel title="The reception" venue={reception} date={date} palette={p} />}
          </div>
        )}
        {hasVenue && !reception && receptionTime && (
          <p style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.12em", color: p.inkSoft, margin: "1.1rem 0 0" }}>Reception follows at {receptionTime}, same place.</p>
        )}
        {hashtag && (
          <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(1.2rem, 5cqw, 1.4rem)", color: p.rust, margin: "1.75rem 0 0" }}>{hashtag}</p>
        )}

        {notes.length > 0 && (
          <div id="travel" style={{ marginTop: "1.8rem" }}>
            <p style={{ ...labelText(p, 11), margin: "0 0 0.4rem" }}>Getting here &amp; staying over</p>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notes.map((note, i) => (
                <li key={i} style={{ display: "flex", gap: "0.9rem", padding: "0.85rem 0", borderTop: `1px solid color-mix(in srgb, ${p.ink} 20%, transparent)` }}>
                  <span aria-hidden style={{ fontFamily: MONO, fontSize: 12, color: p.rust, paddingTop: 3, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: SANS, fontSize: "clamp(15px, 4.2cqw, 17px)", lineHeight: 1.6, color: p.text }}>{note}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
