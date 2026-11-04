import { Calendar, MapPin, Clock, GlassWater } from "lucide-react";
import SectionLabel from "./SectionLabel";
import {
  ceremonyVenue,
  receptionVenue,
  receptionTimeAtCeremony,
  hashtagOf,
  dressCodeOf,
  type VenueView,
} from "@/lib/weddingDetails";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
  weddingDateFormatted: string;
}

type CardIcon = typeof Calendar;

function Links({ venue, primary }: { venue: VenueView; primary: string }) {
  if (!venue.mapUrl && !venue.directionsUrl) return null;
  const linkClass = "label-luxury underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity";
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 pt-1" style={{ fontSize: "0.65rem" }}>
      {venue.mapUrl && (
        <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: primary }}>
          View map<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      {venue.directionsUrl && (
        <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className={linkClass} style={{ color: primary }}>
          Get directions<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </p>
  );
}

export default function DetailsSection({ config, primary, accent, weddingDateFormatted }: Props) {
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const hashtag = hashtagOf(config);
  const dressCode = dressCodeOf(config);

  const hasCeremonyPlace = Boolean(ceremony.name || ceremony.address || ceremony.city);
  const cards: {
    icon: CardIcon;
    label: string;
    time?: string;
    venue?: VenueView;
    note?: string;
    value?: string;
  }[] = [
    { icon: Calendar, label: "Date", value: weddingDateFormatted || "TBD" },
    {
      icon: hasCeremonyPlace ? MapPin : Clock,
      label: "Ceremony",
      time: ceremony.time,
      venue: hasCeremonyPlace ? ceremony : undefined,
      note: receptionTime ? `Reception follows at ${receptionTime}` : undefined,
      value: hasCeremonyPlace || ceremony.time ? undefined : "TBD",
    },
  ];
  if (reception) cards.push({ icon: GlassWater, label: "Reception", time: reception.time, venue: reception });

  const hasExtras = Boolean(hashtag || dressCode);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <SectionLabel eyebrow="Wedding Day" title="The Details" />

        <div className={`grid grid-cols-1 gap-6 ${cards.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {cards.map(({ icon: Icon, label, value, time, venue, note }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-3 rounded-2xl p-8 text-center transition-shadow hover:shadow-ambient"
              style={{
                background: "var(--color-surface-container-low)",
                border: `1px solid ${accent}25`,
              }}
            >
              <div
                className="mb-1 flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{ background: `${accent}25` }}
              >
                <Icon size={22} style={{ color: primary }} aria-hidden />
              </div>
              <p className="label-luxury" style={{ color: "var(--color-on-surface-variant)" }}>
                {label}
              </p>
              {value && (
                <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-on-surface)" }}>
                  {value}
                </p>
              )}
              {time && (
                <p className="text-sm font-medium leading-snug" style={{ color: primary }}>
                  {time}
                </p>
              )}
              {venue && (
                <div className="text-sm leading-snug" style={{ color: "var(--color-on-surface)" }}>
                  {venue.name && <p className="font-medium">{venue.name}</p>}
                  {(venue.address || venue.city) && (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>
                      {[venue.address, venue.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}
              {note && (
                <p className="text-xs italic" style={{ color: "var(--color-on-surface-variant)" }}>
                  {note}
                </p>
              )}
              {venue && <Links venue={venue} primary={primary} />}
            </div>
          ))}
        </div>

        {hasExtras && (
          <div className="mx-auto mt-14 flex max-w-2xl flex-col items-center gap-10 text-center">
            {hashtag && (
              <div>
                <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                  Share your photos
                </p>
                <p className="headline-sm" style={{ color: primary }}>
                  {hashtag}
                </p>
              </div>
            )}
            {dressCode && (
              <div>
                <p className="label-luxury mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                  Dress Code
                </p>
                {dressCode.title && (
                  <p className="headline-sm mb-2" style={{ color: "var(--color-on-surface)" }}>
                    {dressCode.title}
                  </p>
                )}
                {dressCode.description && (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                    {dressCode.description}
                  </p>
                )}
                {dressCode.palette.length > 0 && (
                  <ul
                    aria-label="Suggested colours"
                    className="mt-5 flex flex-wrap items-center justify-center gap-3"
                  >
                    {dressCode.palette.map((hex) => (
                      <li key={hex}>
                        <span
                          className="block h-9 w-9 rounded-full"
                          style={{ background: hex, border: `1px solid ${accent}60`, boxShadow: `0 0 0 3px var(--color-surface), 0 0 0 4px ${accent}30` }}
                        />
                        <span className="sr-only">{hex}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
