import type { CSSProperties } from "react";
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

/** Beyond this many moments the desktop sun path gets too cramped, so it stays a list. */
const MAX_ACROSS = 6;

/**
 * The day as the light changes: each moment marked by a sun a little lower on the horizon.
 * Phones read it as a list; wide screens lay the moments along one horizon so the sun visibly sets.
 */
export default function ScheduleSection({ config, palette: p, band }: Props) {
  const events = (config.schedule ?? []).filter((e) => e.title.trim());
  if (events.length === 0) return null;
  const t = tones(band, p);
  const across = events.length >= 3 && events.length <= MAX_ACROSS;

  return (
    <section aria-labelledby="ah-schedule-title" style={{ background: band.bg, padding: SECTION_PAD }}>
      <div className={across ? "mx-auto max-w-[560px] lg:max-w-[72rem]" : "mx-auto max-w-[560px]"}>
        <SectionTitle id="ah-schedule-title" eyebrow="The day" title="As the light changes" band={band} palette={p} />
        <ol
          className={across ? "lg:grid lg:[grid-template-columns:repeat(var(--ah-cols),minmax(0,1fr))]" : undefined}
          style={{ listStyle: "none", padding: 0, margin: 0, "--ah-cols": events.length } as CSSProperties}
        >
          {events.map((event, i) => {
            const progress = events.length === 1 ? 0.5 : i / (events.length - 1);
            return (
              <li
                key={event.id}
                className={`relative grid grid-cols-[44px_1fr] items-start gap-4 py-[1.1rem] ${i === 0 ? "" : "border-t"} ${across ? "lg:grid-cols-1 lg:justify-items-center lg:gap-3 lg:border-t-0 lg:px-4 lg:py-0 lg:text-center" : ""}`}
                style={{ borderColor: t.rule }}
              >
                {/* One continuous horizon across the row on wide screens; each sun sits on it. */}
                {across && <span aria-hidden className="absolute inset-x-0 top-[40px] hidden h-px lg:block" style={{ background: t.rule }} />}
                <span className={across ? "relative lg:scale-[1.35] lg:origin-top" : "relative"} style={{ display: "block" }}>
                  <SunMark progress={progress} sun={band.dark ? p.butter : p.apricot} line={t.rule} />
                </span>
                <div className={across ? "lg:mt-4" : undefined}>
                  {event.time && (
                    <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: t.accent, margin: 0 }}>{event.time}</p>
                  )}
                  <p style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.35rem, 5.6vw, 1.7rem)", lineHeight: 1.2, color: t.text, margin: "0.2rem 0 0", textWrap: "balance" }}>{event.title}</p>
                  {event.description && (
                    <p style={{ whiteSpace: "pre-line", fontFamily: SANS, fontWeight: 300, fontSize: "1rem", lineHeight: 1.6, color: t.soft, margin: "0.3rem 0 0" }}>{event.description}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
