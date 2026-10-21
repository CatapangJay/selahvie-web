import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { SECTION_PAD, SectionTitle, tones, type Band } from "./Band";
import { SunMark } from "./Ornaments";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  band: Band;
}

/** The day as the light changes: each moment marked by a sun a little lower on the horizon. */
export default function ScheduleSection({ config, palette: p, band }: Props) {
  const events = (config.schedule ?? []).filter((e) => e.title.trim());
  if (events.length === 0) return null;
  const t = tones(band, p);

  return (
    <section aria-labelledby="ah-schedule-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionTitle id="ah-schedule-title" eyebrow="The day" title="As the light changes" band={band} palette={p} />
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {events.map((event, i) => (
            <li key={event.id} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: "1rem", alignItems: "start", padding: "1.1rem 0", borderTop: i === 0 ? "none" : `1px solid ${t.rule}` }}>
              <SunMark progress={events.length === 1 ? 0.5 : i / (events.length - 1)} sun={band.dark ? p.butter : p.apricot} line={t.rule} />
              <div>
                {event.time && (
                  <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: t.accent, margin: 0 }}>{event.time}</p>
                )}
                <p style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.35rem, 5.6vw, 1.7rem)", lineHeight: 1.2, color: t.text, margin: "0.2rem 0 0" }}>{event.title}</p>
                {event.description && (
                  <p style={{ whiteSpace: "pre-line", fontFamily: SANS, fontWeight: 300, fontSize: "1rem", lineHeight: 1.6, color: t.soft, margin: "0.3rem 0 0" }}>{event.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
