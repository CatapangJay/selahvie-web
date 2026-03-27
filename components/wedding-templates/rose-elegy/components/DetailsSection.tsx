import { Calendar, MapPin, Clock } from "lucide-react";
import SectionLabel from "./SectionLabel";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
  weddingDateFormatted: string;
}

export default function DetailsSection({ config, primary, accent, weddingDateFormatted }: Props) {
  const cards = [
    {
      icon: Calendar,
      label: "Date",
      value: weddingDateFormatted || "TBD",
    },
    {
      icon: MapPin,
      label: "Venue",
      value:
        [config.venueName, config.venueAddress, config.venueCity].filter(Boolean).join(", ") ||
        "TBD",
    },
    {
      icon: Clock,
      label: "Ceremony Begins",
      value: "4:00 PM",
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <SectionLabel eyebrow="Wedding Day" title="The Details" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {cards.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition-shadow hover:shadow-ambient"
              style={{
                background: "var(--color-surface-container-low)",
                border: `1px solid ${accent}25`,
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{ background: `${accent}25` }}
              >
                <Icon size={22} style={{ color: primary }} />
              </div>
              <p className="label-luxury" style={{ color: "var(--color-on-surface-variant)" }}>
                {label}
              </p>
              <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-on-surface)" }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
