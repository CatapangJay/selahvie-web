import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, darkroomStyle, mapsUrl, stampText } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** Travel notes are their own audience section; hide them when it is off. */
  showNotes: boolean;
  /** The first programme time doubles as "Doors"; only when the schedule is visible to this guest. */
  showSchedule: boolean;
}

/** An admission ticket with a perforated stub for the venue, and the notes written on its back. */
export default function DetailsSection({ config, palette: p, date, showNotes, showSchedule }: Props) {
  const maps = mapsUrl(config);
  const t = config.travel;
  const notes = showNotes
    ? [t?.directions, t?.accommodations, ...(t?.notes?.split("\n") ?? [])].map((s) => s?.trim()).filter((s): s is string => Boolean(s))
    : [];
  const hasVenue = Boolean(config.venueName || config.venueAddress || config.venueCity);
  if (!hasVenue && notes.length === 0) return null;
  const firstTime = showSchedule ? config.schedule?.find((e) => e.time.trim())?.time : undefined;

  return (
    <section id="details" aria-labelledby="ss-details-title" style={{ ...darkroomStyle(p), padding: "5.5rem 1.25rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="ss-details-title" caption="Where & when" title="The |Venue" color={p.print} accent={p.stamp} />

        {hasVenue && (
          <div style={{ display: "flex", filter: "drop-shadow(0 24px 30px rgba(0,0,0,.45))" }}>
            <div style={{ flex: 1, minWidth: 0, background: p.print, color: p.text, borderRadius: "12px 0 0 12px", padding: "2rem 1.4rem 1.8rem" }}>
              <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.26em", textTransform: "uppercase", color: p.film, margin: 0 }}>Admit all · ceremony</p>
              {config.venueName && (
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(26px, 7.4vw, 38px)", lineHeight: 1.1, color: p.ink, margin: "0.6rem 0 0" }}>{config.venueName}</h3>
              )}
              {(config.venueAddress || config.venueCity) && (
                <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.45, color: p.text, margin: "0.5rem 0 0" }}>
                  {[config.venueAddress, config.venueCity].filter(Boolean).join(", ")}
                </p>
              )}
              {(date.long || firstTime) && (
              <dl style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem 1.75rem", margin: "1.4rem 0 0", paddingTop: "1rem", borderTop: `1px dashed ${p.inkSoft}` }}>
                {date.long && (
                  <div>
                    <dt style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: p.inkSoft }}>Date</dt>
                    <dd style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, color: p.ink, margin: 0 }}>{date.long}</dd>
                  </div>
                )}
                {firstTime && (
                  <div>
                    <dt style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: p.inkSoft }}>Doors</dt>
                    <dd style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, color: p.ink, margin: 0 }}>{firstTime}</dd>
                  </div>
                )}
              </dl>
              )}
              {maps && (
                <a
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: 48,
                    marginTop: "1.4rem",
                    padding: "0 1.4rem",
                    borderRadius: 999,
                    background: p.ink,
                    color: p.print,
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    outlineColor: p.ink,
                  }}
                >
                  Get directions →
                </a>
              )}
            </div>
            <div
              aria-hidden
              style={{
                width: "clamp(58px, 16vw, 78px)",
                flexShrink: 0,
                background: p.film,
                color: p.print,
                borderRadius: "0 12px 12px 0",
                borderLeft: `3px dotted ${p.inkDeep}`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <span style={{ ...stampText(p), color: p.print, textShadow: "none", writingMode: "vertical-rl", fontSize: 15, letterSpacing: "0.3em" }}>{date.dotted || "SAVE THE DATE"}</span>
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div style={{ marginTop: hasVenue ? "3rem" : 0 }}>
            <p style={{ ...stampText(p), textShadow: "none", fontSize: 13, letterSpacing: "0.26em", textTransform: "uppercase", margin: "0 0 0.75rem" }}>Written on the back</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notes.map((note, i) => (
                <li
                  key={i}
                  style={{ display: "flex", gap: "0.9rem", fontFamily: DISPLAY, fontSize: "clamp(17px, 4.6vw, 19px)", lineHeight: 1.55, color: p.paper, padding: "1rem 0", borderTop: `1px solid color-mix(in srgb, ${p.paper} 18%, transparent)` }}
                >
                  <span aria-hidden style={{ fontFamily: MONO, fontSize: 13, color: p.stamp, paddingTop: 4 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
