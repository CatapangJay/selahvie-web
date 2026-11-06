import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { DISPLAY, MONO, SANS, paperStyle } from "../theme";
import { SHEET_PAD, SectionHeading } from "./Motion";

/** The order of the day as a collection log: typed times in a narrow column, entries on hairlines. */
export default function ScheduleSection({ config, palette: p }: { config: WeddingConfig; palette: Palette }) {
  const events = (config.schedule ?? []).filter((e) => e.title.trim() || e.time.trim());
  if (events.length === 0) return null;
  return (
    <section id="schedule" aria-labelledby="ef-schedule-title" style={{ ...paperStyle(p), padding: SHEET_PAD }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <SectionHeading id="ef-schedule-title" caption="Collection log" title="The order of the day" ink={p.ink} soft={p.inkSoft} rust={p.rust} />
        <ol style={{ listStyle: "none", padding: 0, margin: 0, borderBottom: `1px solid color-mix(in srgb, ${p.ink} 22%, transparent)` }}>
          {events.map((e) => (
            <li key={e.id} style={{ display: "grid", gridTemplateColumns: "5.6rem 1fr", gap: "0.9rem", padding: "1.05rem 0", borderTop: `1px solid color-mix(in srgb, ${p.ink} 22%, transparent)` }}>
              <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.06em", color: p.rust, paddingTop: 5 }}>{e.time}</span>
              <span>
                <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.2rem, 5.2cqw, 1.45rem)", lineHeight: 1.25, color: p.ink }}>{e.title}</span>
                {e.description?.trim() && <span style={{ display: "block", fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: p.inkSoft, marginTop: 3 }}>{e.description}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
