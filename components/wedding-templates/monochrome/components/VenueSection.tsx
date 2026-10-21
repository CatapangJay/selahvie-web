import { ArrowUpRight } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { BODY, HEADING, mapsUrl } from "../theme";
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

/** A black print of the venue on stone, then arrival notes as numbered lines. */
export default function VenueSection({ config, palette: p, index, showNotes }: Props) {
  const address = [config.venueAddress, config.venueCity].filter(Boolean).join(", ");
  const maps = mapsUrl(config);
  const travel = config.travel;
  const notes = showNotes
    ? [travel?.directions, travel?.accommodations, travel?.notes]
        .flatMap((block) => block?.split("\n") ?? [])
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
    : [];

  if (!config.venueName && !address && notes.length === 0) return null;

  return (
    <section id="venues" aria-labelledby="mc-venue-title" style={{ background: p.stone, padding: "6rem 1.25rem", textAlign: "center" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <SectionHeading id="mc-venue-title" index={index} eyebrow="Where to find us" title="The Venue" color={p.slate} muted="rgba(36,39,44,.55)" />

        {(config.venueName || address) && (
          <div style={{ position: "relative", background: p.ink, color: "#fff", padding: "clamp(2.5rem, 8vw, 3.5rem) clamp(1.25rem, 6vw, 2.5rem)", margin: "0 0.5rem" }}>
            <div aria-hidden style={{ position: "absolute", inset: 10, border: "1px solid rgba(255,255,255,.18)", pointerEvents: "none" }}>
              <CornerTicks color="rgba(255,255,255,.55)" />
            </div>
            {config.venueName && (
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
                {config.venueName}
              </h3>
            )}
            {address && (
              <p style={{ fontFamily: BODY, fontSize: "clamp(15px, 4.2vw, 17px)", letterSpacing: "0.16em", textTransform: "uppercase", lineHeight: 1.6, color: "rgba(255,255,255,.7)", maxWidth: 420, margin: "1rem auto 0" }}>
                {address}
              </p>
            )}
            {maps && (
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 46,
                  marginTop: "2rem",
                  padding: "0 1.4rem",
                  border: "1px solid rgba(255,255,255,.75)",
                  color: "#fff",
                  fontFamily: BODY,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Get directions
                <ArrowUpRight size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
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
