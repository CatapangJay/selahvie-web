import { Calendar, MailOpen, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import type { WeddingConfig } from "@/types/wedding";
import Reveal from "@/components/ui/Reveal";
import type { DateParts, Palette } from "../theme";
import { SCRIPT, SECTION_PAD, SERIF, feltStyle, paperStyle } from "../theme";
import SectionHeading from "./SectionHeading";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  rsvpDeadline: DateParts;
  showRsvp: boolean;
}

function Card({ p, icon, label, children }: { p: Palette; icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div
      className="flex h-full flex-col items-center text-center"
      style={{
        ...paperStyle(p.cream, p.creamDeep),
        color: p.ink,
        padding: "clamp(2rem, 4vw, 2.75rem) clamp(1.5rem, 3vw, 2rem)",
        boxShadow: `inset 0 0 0 7px ${p.cream}, inset 0 0 0 8px ${p.gold}, 0 22px 44px -20px rgba(0,0,0,.6)`,
      }}
    >
      <span aria-hidden style={{ color: p.raspberry }}>
        {icon}
      </span>
      <p
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: "0.82rem",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: p.goldInk,
          marginTop: "0.9rem",
        }}
      >
        {label}
      </p>
      <div style={{ marginTop: "0.75rem" }}>{children}</div>
    </div>
  );
}

const big = (p: Palette) => ({ fontFamily: SCRIPT, fontSize: "clamp(2rem, 4vw, 2.5rem)", lineHeight: 1.15, color: p.raspberryDeep });
const small = { fontFamily: SERIF, fontSize: "1.2rem", lineHeight: 1.5 } as const;

export default function DetailsSection({ config, palette: p, date, rsvpDeadline, showRsvp }: Props) {
  const address = [config.venueAddress, config.venueCity].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [config.venueName, config.venueAddress, config.venueCity].filter(Boolean).join(" ")
  )}`;
  const deadlineText = rsvpDeadline.date ? `${rsvpDeadline.monthDay}, ${rsvpDeadline.year}` : rsvpDeadline.long;

  return (
    <section id="details" aria-labelledby="jt-details-title" style={{ ...feltStyle(p.teal, p.tealDeep), padding: SECTION_PAD }}>
      <div className="mx-auto" style={{ maxWidth: "64rem" }}>
        <SectionHeading id="jt-details-title" eyebrow="The Celebration" title="Save Our Date" palette={p} tone="dark" />

        <div className="grid gap-6 md:grid-cols-3" style={{ gap: "clamp(1.25rem, 3vw, 2rem)" }}>
          <Reveal index={0} className="h-full">
            <Card p={p} icon={<Calendar size={26} strokeWidth={1.4} />} label="When">
              <p style={big(p)}>{date.monthDay}</p>
              <p style={{ ...small, marginTop: "0.25rem" }}>
                {date.weekday && `${date.weekday}, `}
                {date.year}
              </p>
            </Card>
          </Reveal>

          <Reveal index={1} className="h-full">
            <Card p={p} icon={<MapPin size={26} strokeWidth={1.4} />} label="Where">
              <p style={big(p)}>{config.venueName}</p>
              {address && <p style={{ ...small, marginTop: "0.25rem" }}>{address}</p>}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2b1018]"
                style={{ ...small, fontStyle: "italic", color: p.raspberry }}
              >
                Open in Maps
              </a>
            </Card>
          </Reveal>

          <Reveal index={2} className="h-full">
            <Card p={p} icon={<MailOpen size={26} strokeWidth={1.4} />} label="Reply By">
              <p style={big(p)}>{deadlineText || "As soon as you can"}</p>
              {showRsvp && (
                <a
                  href="#rsvp"
                  className="mt-4 inline-block underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2b1018]"
                  style={{ ...small, fontStyle: "italic", color: p.raspberry }}
                >
                  Send your RSVP
                </a>
              )}
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
