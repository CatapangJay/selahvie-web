import { ArrowUpRight } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import { ceremonyVenue, dressCodeOf, hashtagOf, receptionTimeAtCeremony, receptionVenue, type VenueView } from "@/lib/weddingDetails";
import type { Palette } from "../theme";
import { ACCENT, BODY, HEADING } from "../theme";
import { SectionHeading } from "./Motion";
import { CornerTicks } from "./Preloader";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** Contact-sheet frame number for the heading. */
  index: string;
  /** Show the travel notes as the numbered "Before you arrive" list. */
  showNotes: boolean;
}

const BUTTON_CLASS =
  "group transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const BUTTON_STYLE = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 46,
  padding: "0 1.4rem",
  border: "1px solid rgba(255,255,255,.75)",
  color: "#fff",
  fontFamily: BODY,
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  textDecoration: "none",
} as const;

/** One black print: label, time, name, address and the map links. */
function VenuePrint({ p, label, venue, time, note }: { p: Palette; label: string; venue: VenueView | null; time: string; note?: string }) {
  const address = venue ? [venue.address, venue.city].filter(Boolean).join(", ") : "";
  return (
    <div style={{ position: "relative", background: p.ink, color: "#fff", padding: "clamp(2.5rem, 8vw, 3.5rem) clamp(1.25rem, 6vw, 2.5rem)", margin: "0 0.5rem" }}>
      <div aria-hidden style={{ position: "absolute", inset: 10, border: "1px solid rgba(255,255,255,.18)", pointerEvents: "none" }}>
        <CornerTicks color="rgba(255,255,255,.55)" />
      </div>
      <p style={{ position: "relative", fontFamily: BODY, fontSize: 13, fontWeight: 600, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", margin: "0 0 1rem" }}>
        {label}
        {time && <> &nbsp;/&nbsp; {time}</>}
      </p>
      {venue?.name && (
        <h3
          style={{
            fontFamily: HEADING,
            fontSize: "clamp(28px, 8vw, 44px)",
            fontWeight: 300,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            lineHeight: 1.1,
            margin: 0,
            textWrap: "balance",
          }}
        >
          {venue.name}
        </h3>
      )}
      {address && (
        <p style={{ fontFamily: BODY, fontSize: "clamp(15px, 4.2vw, 17px)", letterSpacing: "0.16em", textTransform: "uppercase", lineHeight: 1.6, color: "rgba(255,255,255,.7)", maxWidth: 420, margin: "1rem auto 0" }}>
          {address}
        </p>
      )}
      {note && <p style={{ fontFamily: HEADING, fontWeight: 300, fontSize: "clamp(16px, 4.4vw, 18px)", lineHeight: 1.6, color: "rgba(255,255,255,.8)", margin: 0 }}>{note}</p>}
      {venue && (venue.mapUrl || venue.directionsUrl) && (
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: "2rem" }}>
          {venue.mapUrl && (
            <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className={BUTTON_CLASS} style={BUTTON_STYLE}>
              View map
              <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
          {venue.directionsUrl && (
            <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className={BUTTON_CLASS} style={BUTTON_STYLE}>
              Get directions
              <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** A black print of the venue on stone, then dress code, hashtag and arrival notes as numbered lines. */
export default function VenueSection({ config, palette: p, index, showNotes }: Props) {
  const ceremony = ceremonyVenue(config);
  const hasCeremony = Boolean(ceremony.name || ceremony.address || ceremony.city);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const dress = dressCodeOf(config);
  const hashtag = hashtagOf(config);
  const travel = config.travel;
  const notes = showNotes
    ? [travel?.directions, travel?.accommodations, travel?.notes]
        .flatMap((block) => block?.split("\n") ?? [])
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
    : [];

  if (!hasCeremony && notes.length === 0 && !dress && !hashtag) return null;

  return (
    <section id="venues" aria-labelledby="mc-venue-title" style={{ background: p.stone, padding: "6rem 1.25rem", textAlign: "center" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <SectionHeading id="mc-venue-title" index={index} eyebrow="Where to find us" title="The Venue" color={p.slate} muted="rgba(36,39,44,.55)" />

        {hasCeremony && <VenuePrint p={p} label="Ceremony" venue={ceremony} time={ceremony.time} />}
        {reception && (
          <div style={{ marginTop: "1.5rem" }}>
            <VenuePrint p={p} label="Reception" venue={reception} time={reception.time} />
          </div>
        )}
        {!reception && receptionTime && (
          <p style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, letterSpacing: "0.26em", textTransform: "uppercase", color: p.slate, margin: "1.75rem 0 0" }}>
            Reception follows at {receptionTime}
          </p>
        )}

        {dress && (
          <div style={{ marginTop: "4rem", borderTop: `1px solid ${p.slate}`, paddingTop: "1.75rem" }}>
            <p style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: p.slate, margin: "0 0 0.75rem" }}>
              Dress code
            </p>
            {dress.title && (
              <h3 style={{ fontFamily: HEADING, fontSize: "clamp(22px, 6vw, 30px)", fontWeight: 300, letterSpacing: "0.06em", textTransform: "uppercase", color: p.slate, margin: 0 }}>{dress.title}</h3>
            )}
            {dress.description && (
              <p style={{ fontFamily: HEADING, fontSize: "clamp(16px, 4.4vw, 18px)", fontWeight: 300, lineHeight: 1.6, color: p.slate, margin: "0.6rem auto 0", maxWidth: 460 }}>{dress.description}</p>
            )}
            {dress.palette.length > 0 && (
              <ul aria-label="Suggested colour palette" style={{ listStyle: "none", padding: 0, margin: "1.25rem 0 0", display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                {dress.palette.map((hex) => (
                  <li key={hex} role="img" aria-label={`Palette colour ${hex}`} title={hex} style={{ width: 36, height: 36, background: hex, outline: `1px solid ${p.slate}`, outlineOffset: 3 }} />
                ))}
              </ul>
            )}
          </div>
        )}

        {hashtag && (
          <p style={{ fontFamily: ACCENT, fontSize: "clamp(34px, 9vw, 46px)", lineHeight: 1.2, color: p.slate, margin: dress ? "2.5rem 0 0" : "3rem 0 0" }}>{hashtag}</p>
        )}

        {notes.length > 0 && (
          <div style={{ marginTop: "4rem", textAlign: "left" }}>
            <p style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: p.slate, margin: "0 0 1rem", textAlign: "center" }}>
              Before you arrive
            </p>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, borderTop: `1px solid ${p.slate}` }}>
              {notes.map((note, i) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "2.75rem 1fr", alignItems: "baseline", padding: "1.15rem 0.25rem", borderBottom: "1px solid rgba(36,39,44,.25)" }}>
                  <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, letterSpacing: "0.1em", color: "rgba(36,39,44,.55)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: HEADING, fontSize: "clamp(16px, 4.4vw, 18px)", fontWeight: 300, lineHeight: 1.55, color: p.slate }}>{note}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
