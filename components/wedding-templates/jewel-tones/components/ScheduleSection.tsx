import type { WeddingConfig } from "@/types/wedding";
import Reveal from "@/components/ui/Reveal";
import type { Palette } from "../theme";
import { SCRIPT, SECTION_PAD, SERIF, feltStyle } from "../theme";
import SectionHeading from "./SectionHeading";

interface Props {
  config: WeddingConfig;
  palette: Palette;
}

/** Vertical timeline: time on the left, a gilt diamond on the rail, the event on the right. */
export default function ScheduleSection({ config, palette: p }: Props) {
  const events = (config.schedule ?? []).filter((e) => e.title.trim());
  if (events.length === 0) return null;

  const MARK = "1.85rem";
  const last = events.length - 1;

  return (
    <section id="schedule" aria-labelledby="jt-schedule-title" style={{ ...feltStyle(p.raspberry, p.raspberryDeep), padding: SECTION_PAD }}>
      <div className="mx-auto" style={{ maxWidth: "46rem" }}>
        <SectionHeading id="jt-schedule-title" eyebrow="The Day" title="Order of Events" palette={p} tone="dark" />

        <ol>
          {events.map((ev, i) => (
            <Reveal as="li" key={ev.id} index={0} className="grid grid-cols-[5.5rem_2rem_1fr] sm:grid-cols-[1fr_2.5rem_1.4fr]">
              <p
                className="text-right"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: p.goldLight,
                  paddingTop: "1.4rem",
                  lineHeight: "1rem",
                }}
              >
                {ev.time}
              </p>

              <div aria-hidden className="relative">
                {events.length > 1 && (
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      width: 1,
                      transform: "translateX(-50%)",
                      background: `linear-gradient(180deg, ${p.gold}, ${p.gold}99)`,
                      top: i === 0 ? MARK : 0,
                      ...(i === last ? { height: MARK } : { bottom: 0 }),
                    }}
                  />
                )}
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: MARK,
                    width: 11,
                    height: 11,
                    transform: "translate(-50%, -50%) rotate(45deg)",
                    background: p.gold,
                    boxShadow: `0 0 0 4px ${p.raspberryDeep}`,
                  }}
                />
              </div>

              <div style={{ padding: "1rem 0 1.75rem" }}>
                <p style={{ fontFamily: SCRIPT, fontSize: "clamp(1.8rem, 4vw, 2.2rem)", lineHeight: 1.2, color: p.cream }}>{ev.title}</p>
                {ev.description && (
                  <p style={{ fontFamily: SERIF, fontSize: "1.15rem", lineHeight: 1.5, color: "rgba(251,246,236,.86)", marginTop: "0.15rem" }}>
                    {ev.description}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
