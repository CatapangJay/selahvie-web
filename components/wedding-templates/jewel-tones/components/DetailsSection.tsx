import { Calendar, Clock, MailOpen, MapPin, Shirt, Wine } from "lucide-react";
import type { ReactNode } from "react";
import type { WeddingConfig } from "@/types/wedding";
import Reveal from "@/components/ui/Reveal";
import { ceremonyVenue, dressCodeOf, hashtagOf, receptionTimeAtCeremony, receptionVenue, type VenueView } from "@/lib/weddingDetails";
import type { DateParts, Palette } from "../theme";
import { SCRIPT, SECTION_PAD, SERIF, feltStyle, paperStyle } from "../theme";
import SectionHeading from "./SectionHeading";
import Countdown from "./Countdown";

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

const LINK =
  "inline-block underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2b1018]";

function VenueBody({ p, venue, time }: { p: Palette; venue: VenueView; time: string }) {
  const address = [venue.address, venue.city].filter(Boolean).join(", ");
  return (
    <>
      {time && (
        <p className="inline-flex items-center gap-2" style={{ ...small, color: p.goldInk, fontWeight: 600, marginBottom: "0.5rem" }}>
          <Clock size={16} strokeWidth={1.6} aria-hidden />
          {time}
        </p>
      )}
      {venue.name && <p style={big(p)}>{venue.name}</p>}
      {address && <p style={{ ...small, marginTop: "0.25rem" }}>{address}</p>}
      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
        {venue.mapUrl && (
          <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className={LINK} style={{ ...small, fontStyle: "italic", color: p.raspberry }}>
            Open in Maps
          </a>
        )}
        {venue.directionsUrl && (
          <a href={venue.directionsUrl} target="_blank" rel="noopener noreferrer" className={LINK} style={{ ...small, fontStyle: "italic", color: p.raspberry }}>
            Get directions
          </a>
        )}
      </p>
    </>
  );
}

const big = (p: Palette) => ({ fontFamily: SCRIPT, fontSize: "clamp(2rem, 4vw, 2.5rem)", lineHeight: 1.15, color: p.raspberryDeep });
const small = { fontFamily: SERIF, fontSize: "1.2rem", lineHeight: 1.5 } as const;

export default function DetailsSection({ config, palette: p, date, rsvpDeadline, showRsvp }: Props) {
  const ceremony = ceremonyVenue(config);
  const reception = receptionVenue(config);
  const receptionTime = receptionTimeAtCeremony(config);
  const dress = dressCodeOf(config);
  const hashtag = hashtagOf(config);
  const deadlineText = rsvpDeadline.date ? `${rsvpDeadline.monthDay}, ${rsvpDeadline.year}` : rsvpDeadline.long;

  return (
    <section id="details" aria-labelledby="jt-details-title" style={{ ...feltStyle(p.teal, p.tealDeep), padding: SECTION_PAD }}>
      <div className="mx-auto" style={{ maxWidth: "64rem" }}>
        <SectionHeading id="jt-details-title" eyebrow="The Celebration" title="Mark the Date" palette={p} tone="dark" />

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
            <Card p={p} icon={<MapPin size={26} strokeWidth={1.4} />} label="Ceremony">
              <VenueBody p={p} venue={ceremony} time={ceremony.time} />
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

        {(reception || receptionTime || dress) && (
          <div className="mx-auto grid md:grid-cols-2" style={{ gap: "clamp(1.25rem, 3vw, 2rem)", marginTop: "clamp(1.25rem, 3vw, 2rem)", maxWidth: reception && dress ? undefined : "32rem" }}>
            {reception ? (
              <Reveal index={0} className="h-full">
                <Card p={p} icon={<Wine size={26} strokeWidth={1.4} />} label="Reception">
                  <VenueBody p={p} venue={reception} time={reception.time} />
                </Card>
              </Reveal>
            ) : (
              receptionTime && (
                <Reveal index={0} className="h-full">
                  <Card p={p} icon={<Wine size={26} strokeWidth={1.4} />} label="Reception">
                    <p style={big(p)}>{receptionTime}</p>
                    <p style={{ ...small, marginTop: "0.25rem" }}>At the same venue, following the ceremony</p>
                  </Card>
                </Reveal>
              )
            )}
            {dress && (
              <Reveal index={1} className="h-full">
                <Card p={p} icon={<Shirt size={26} strokeWidth={1.4} />} label="Dress Code">
                  {dress.title && <p style={big(p)}>{dress.title}</p>}
                  {dress.description && <p style={{ ...small, marginTop: "0.25rem" }}>{dress.description}</p>}
                  {dress.palette.length > 0 && (
                    <ul className="mt-4 flex flex-wrap items-center justify-center gap-3" aria-label="Suggested colour palette">
                      {dress.palette.map((hex) => (
                        <li
                          key={hex}
                          role="img"
                          aria-label={`Palette colour ${hex}`}
                          title={hex}
                          style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: hex, boxShadow: `0 0 0 2px ${p.cream}, 0 0 0 3px ${p.gold}` }}
                        />
                      ))}
                    </ul>
                  )}
                </Card>
              </Reveal>
            )}
          </div>
        )}

        {hashtag && (
          <Reveal index={0} className="text-center" style={{ marginTop: "clamp(2.5rem, 6vw, 3.5rem)" }}>
            <p style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "0.82rem", letterSpacing: "0.32em", textTransform: "uppercase", color: p.goldLight }}>
              Share the day
            </p>
            <p style={{ fontFamily: SCRIPT, fontSize: "clamp(2rem, 6vw, 3rem)", lineHeight: 1.2, color: p.cream, marginTop: "0.25rem" }}>{hashtag}</p>
          </Reveal>
        )}

        {date.date && (
          <Reveal index={0} style={{ marginTop: "clamp(3.5rem, 8vw, 5rem)" }}>
            <Countdown target={date.date} palette={p} />
          </Reveal>
        )}
      </div>
    </section>
  );
}
