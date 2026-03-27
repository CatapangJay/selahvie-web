import SectionLabel from "./SectionLabel";

interface ScheduleItem {
  time: string;
  event: string;
  detail: string;
}

interface Props {
  primary: string;
  accent: string;
  items?: ScheduleItem[];
}

const DEFAULT_ITEMS: ScheduleItem[] = [
  { time: "3:30 PM", event: "Guests Arrive",   detail: "Welcome drinks in the garden courtyard" },
  { time: "4:00 PM", event: "Ceremony",        detail: "The exchange of vows"                  },
  { time: "5:00 PM", event: "Cocktail Hour",   detail: "Champagne & canapés on the terrace"    },
  { time: "6:30 PM", event: "Reception Dinner",detail: "Seated dinner in the grand hall"        },
  { time: "9:00 PM", event: "Dancing",         detail: "Live music until midnight"              },
];

export default function ScheduleSection({ primary, accent, items = DEFAULT_ITEMS }: Props) {
  return (
    <section className="py-24" style={{ background: "var(--color-surface-container-low)" }}>
      <div className="mx-auto max-w-2xl px-6">
        <SectionLabel eyebrow="What To Expect" title="Day-Of Schedule" />

        <div className="relative">
          {/* Vertical rail line */}
          <div
            className="absolute left-[5.5rem] top-0 bottom-0 w-px"
            style={{ background: `${accent}40` }}
          />

          {items.map(({ time, event, detail }, i) => (
            <div key={i} className="flex gap-6 mb-8 relative">
              {/* Time label */}
              <div className="text-right w-20 flex-shrink-0 pt-0.5">
                <p className="label-luxury text-[0.65rem]" style={{ color: "var(--color-on-surface-variant)" }}>
                  {time}
                </p>
              </div>

              {/* Timeline node */}
              <div
                className="relative flex-shrink-0 w-3 h-3 rounded-full mt-1"
                style={{
                  background: primary,
                  outline: `3px solid ${accent}40`,
                  outlineOffset: "2px",
                  zIndex: 1,
                }}
              />

              {/* Event content */}
              <div className="pb-2">
                <p className="font-semibold text-sm" style={{ color: "var(--color-on-surface)" }}>
                  {event}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
