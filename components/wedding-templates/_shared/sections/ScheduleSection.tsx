"use client";

import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
}

/**
 * Itinerary / schedule as a vertical timeline rail. Renders nothing until an
 * event is added. Distinct from templates' own hardcoded "day-of" schedule —
 * this is the couple-editable multi-event list from WeddingConfig.schedule.
 */
export default function ScheduleSection({ config, primary, accent }: Props) {
  const events = (config.schedule ?? []).filter((e) => e.title.trim());
  if (events.length === 0) return null;

  return (
    <section className="py-24" id="schedule">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-12 text-center">
          <p className="label-luxury mb-3" style={{ color: primary }}>The Day</p>
          <h2 className="headline-md" style={{ color: "var(--color-on-surface)" }}>Order of Events</h2>
        </div>

        <ol className="relative ml-3" style={{ borderLeft: `1px solid ${accent}40` }}>
          {events.map((ev) => (
            <li key={ev.id} className="relative pb-10 pl-8 last:pb-0">
              <span
                className="absolute -left-[6px] top-1.5 h-3 w-3 rounded-full"
                style={{ background: primary, boxShadow: `0 0 0 4px var(--color-surface)` }}
                aria-hidden
              />
              {ev.time && (
                <p className="label-luxury mb-1" style={{ color: primary }}>{ev.time}</p>
              )}
              <p className="text-base font-medium" style={{ color: "var(--color-on-surface)" }}>{ev.title}</p>
              {ev.description && (
                <p className="mt-1 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                  {ev.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
