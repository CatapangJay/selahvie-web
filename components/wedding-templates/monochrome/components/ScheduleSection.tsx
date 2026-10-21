import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { BODY, HEADING } from "../theme";
import { SectionHeading } from "./Motion";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  /** Contact-sheet frame number for the heading. */
  index: string;
}

/** A ruled timetable: the time in condensed caps on the left, the moment on the right. */
export default function ScheduleSection({ config, palette: p, index }: Props) {
  const events = (config.schedule ?? []).filter((e) => e.title.trim());
  if (events.length === 0) return null;

  return (
    <section aria-labelledby="mc-schedule-title" style={{ background: p.ink, padding: "6rem 1.25rem", textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionHeading id="mc-schedule-title" index={index} eyebrow="The day" title="Order of Events" color="#fff" muted="rgba(255,255,255,.55)" />
        <ol style={{ listStyle: "none", padding: 0, margin: 0, textAlign: "left", borderTop: "1px solid rgba(255,255,255,.4)" }}>
          {events.map((event) => (
            <li
              key={event.id}
              style={{ display: "grid", gridTemplateColumns: "minmax(5.5rem, 28%) 1fr", gap: "1rem", padding: "1.6rem 0.25rem", borderBottom: "1px solid rgba(255,255,255,.18)" }}
            >
              <p style={{ fontFamily: BODY, fontSize: "clamp(15px, 4vw, 17px)", fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", margin: "0.3rem 0 0" }}>
                {event.time}
              </p>
              <div>
                <p style={{ fontFamily: HEADING, fontSize: "clamp(22px, 6vw, 30px)", fontWeight: 300, lineHeight: 1.2, color: "#fff", margin: 0 }}>{event.title}</p>
                {event.description && (
                  <p style={{ whiteSpace: "pre-line", fontFamily: HEADING, fontSize: "clamp(14px, 3.9vw, 16px)", fontWeight: 300, lineHeight: 1.55, color: "rgba(255,255,255,.68)", margin: "0.4rem 0 0" }}>
                    {event.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
