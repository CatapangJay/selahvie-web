"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, SANS, cssImage, labelText, paperStyle, sheetStyle, tapeStyle } from "../theme";
import { Sprig } from "./Specimens";
import Countdown from "./Countdown";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The folio has begun to unfold: play the entrance. */
  started: boolean;
  greeting: { name: string; message: string } | null;
  /** Show the "leave a note" link (guestbook visible to this guest). */
  showGuestbookLink: boolean;
  showRsvpLink: boolean;
}

/**
 * Name sizes that keep the longer line inside its column, in the invitation's
 * own container units: one for the phone stack (also capped by viewport height
 * so the label and countdown stay on the first screen) and one for the label
 * column beside the photograph on wide screens.
 */
function nameSizes(p1: string, p2: string): CSSProperties {
  const a = p1.trim().length;
  const b = p2.trim().length;
  const sm = Math.max(5, a, b + 2);
  const lg = Math.max(5, a, b + 3);
  return {
    "--ef-name": `clamp(2rem, min(15cqw, ${(150 / sm).toFixed(1)}cqw, 7.4svh), 5.6rem)`,
    "--ef-name-lg": `clamp(2.75rem, min(${(40 / (lg * 0.52)).toFixed(2)}cqw, 12svh), 6rem)`,
  } as CSSProperties;
}

/**
 * The first sheet of the folio. On a phone it stacks: a photograph tipped in
 * with linen tape and a pressed sprig across its corner, the slip made out to
 * the guest, the names, then the specimen label with date, locality and the
 * time left. On a wide screen it is laid out like a herbarium sheet turned
 * landscape: the photograph and specimen mounted on the left with the guest's
 * slip glued over its corner, and the names set over a typed label on the
 * right. Blocks rise in turn once the folds begin to open.
 */
export default function HeroSection({ config, palette: p, date, started, greeting, showGuestbookLink, showRsvpLink }: Props) {
  const reduce = useReducedMotion();
  const show = started || Boolean(reduce);
  const names = `${config.partner1Name} & ${config.partner2Name}`;
  const photo = cssImage(config.heroImageUrl);
  const locality = [config.venueName, config.venueCity].filter(Boolean).join(", ");
  // Labels on the first sheet sit a shade darker than the folio's usual soft ink, to keep 4.5:1 on paper.
  const lp: Palette = { ...p, inkSoft: `color-mix(in srgb, ${p.ink} 80%, ${p.paper})` };
  const hair = (pct: number) => `1px solid color-mix(in srgb, ${p.ink} ${pct}%, transparent)`;

  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 2, delay: 0.35 + i * 0.18, ease: [0.16, 1, 0.3, 1] as const },
  });

  const link = (filled: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 1.35rem",
    borderRadius: 2,
    border: `1px solid ${p.ink}`,
    background: filled ? p.ink : "transparent",
    color: filled ? p.sheet : p.ink,
    fontFamily: MONO,
    fontSize: 12,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    textDecoration: "none",
    outlineColor: p.ink,
  });

  const slip = (wide: boolean) =>
    greeting && (
      <div
        role="note"
        aria-label={`Invitation for ${greeting.name}`}
        style={{ ...sheetStyle(p), position: "relative", padding: wide ? "1.1rem 1.15rem 1rem" : "0.7rem 0.95rem 0.75rem", transform: `rotate(${wide ? 2.2 : -0.6}deg)`, outline: hair(18), outlineOffset: -4 }}
      >
        <span aria-hidden style={{ ...tapeStyle(p, wide ? -4 : 3), width: 64, height: 18, top: -9, left: "50%", marginLeft: -32 }} />
        <p style={{ ...labelText(p, 10), color: p.rust, margin: 0 }}>Prepared for</p>
        <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: wide ? "1.45rem" : "clamp(1.2rem, 5.4cqw, 1.45rem)", lineHeight: 1.2, color: p.ink, margin: "0.15rem 0 0", overflowWrap: "anywhere" }}>{greeting.name}</p>
        {greeting.message && <p style={{ fontFamily: SANS, fontSize: wide ? 15 : 14, lineHeight: 1.5, color: p.text, margin: "0.2rem 0 0" }}>{greeting.message}</p>}
      </div>
    );

  return (
    <header
      aria-labelledby="ef-hero-title"
      className="relative overflow-hidden px-5 pb-10 pt-5 lg:flex lg:min-h-svh lg:flex-col lg:px-[clamp(2.5rem,5cqw,5rem)] lg:pb-[5.5rem] lg:pt-[clamp(1.5rem,4svh,2.75rem)]"
      style={paperStyle(p)}
    >
      {/* Wide screens: a long sprig tucked behind the label, as if the specimen ran off the sheet. */}
      <div className="hidden lg:contents">
        <Sprig which={2} width="min(26cqw, 24rem)" rotate={-152} style={{ right: "-4%", bottom: "-16%", opacity: 0.8 }} />
      </div>

      <div className="relative mx-auto w-full max-w-[600px] lg:flex lg:max-w-[80rem] lg:flex-1 lg:flex-col">
        <motion.p {...rise(0)} style={{ ...labelText(lp, 11), display: "flex", justifyContent: "space-between", gap: "1rem", margin: 0, paddingBottom: "0.6rem", borderBottom: hair(22) }}>
          <span>Herbarium of a marriage</span>
          {date.collected && <span aria-hidden className="hidden lg:inline">Coll. {date.collected}</span>}
          <span aria-hidden>Sheet 01</span>
        </motion.p>

        <div className="lg:mt-[clamp(1rem,3svh,2rem)] lg:grid lg:flex-1 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-x-[clamp(3rem,6cqw,7rem)]">
          {/* Tipped-in photograph with the pressed specimen across its corner */}
          <motion.div {...rise(1)} className="relative mx-auto mt-4 w-full max-w-[30rem] lg:ml-[clamp(0.5rem,2.5cqw,2.5rem)] lg:mt-0 lg:w-auto lg:max-w-none">
            <div className="p-2 lg:px-[0.55rem] lg:pb-0 lg:pt-[0.55rem]" style={{ ...sheetStyle(p), transform: "rotate(-1.2deg)" }}>
              <div
                role={photo ? "img" : undefined}
                aria-label={photo ? names : undefined}
                aria-hidden={photo ? undefined : true}
                className="h-[clamp(9rem,calc(88svh_-_24.25rem),26rem)] w-full lg:h-[var(--ef-photo)] lg:w-[calc(var(--ef-photo)*0.8)]"
                style={{ "--ef-photo": "clamp(22rem, calc(100svh - 13.5rem), 42rem)", backgroundColor: "#C9C6B4", backgroundImage: photo, backgroundSize: "cover", backgroundPosition: "center 30%" } as CSSProperties}
              />
              <p aria-hidden className="hidden lg:block" style={{ ...labelText(lp, 10), margin: 0, padding: "0.45rem 0 0.55rem", textAlign: "right" }}>
                fig. 1 — the two of us
              </p>
            </div>
            <span aria-hidden style={{ ...tapeStyle(p, -38), top: 4, left: -18 }} />
            <span aria-hidden style={{ ...tapeStyle(p, 34), top: 2, right: -20 }} />
            <div className="contents lg:hidden">
              <Sprig which={0} width="25cqw" rotate={28} style={{ left: "-7%", bottom: "-14%", zIndex: 1, maxWidth: 150 }} />
            </div>
            <div className="hidden lg:contents">
              <Sprig which={0} width="min(21svh, 15rem)" rotate={24} style={{ left: "-14%", bottom: "-8%", zIndex: 1 }} />
            </div>
            {greeting && (
              <motion.div {...rise(5)} className="absolute z-[2] hidden w-[16rem] lg:block" style={{ right: "-2.5rem", bottom: "11%" }}>
                {slip(true)}
              </motion.div>
            )}
          </motion.div>

          {/* The label column: names over a typed specimen label */}
          <div className="relative z-[2] flex flex-col lg:max-w-[40rem]">
            {greeting && (
              <motion.div {...rise(2)} className="relative z-[3] order-1 -mt-8 ml-auto mr-1 w-[min(86%,17.5rem)] lg:hidden">
                {slip(false)}
              </motion.div>
            )}

            <h1
              id="ef-hero-title"
              aria-label={names}
              className="order-2 mt-[clamp(0.25rem,1.2svh,0.9rem)] text-[length:var(--ef-name)] lg:mt-0 lg:text-[length:var(--ef-name-lg)]"
              style={{ ...nameSizes(config.partner1Name, config.partner2Name), fontFamily: DISPLAY, fontWeight: 300, lineHeight: 0.98, letterSpacing: "-0.02em", color: p.ink, marginBottom: 0, overflowWrap: "anywhere" }}
            >
              <motion.span {...rise(2)} style={{ display: "block" }}>{config.partner1Name}</motion.span>
              <motion.span {...rise(3)} className="pl-[12cqw] lg:pl-[0.9em]" style={{ display: "block" }}>
                <em aria-hidden style={{ color: p.rust, fontWeight: 300, marginRight: "0.12em" }}>&amp;</em>
                {config.partner2Name}
              </motion.span>
            </h1>

            <motion.p
              {...rise(4)}
              className="order-4 mt-6 lg:order-3 lg:mt-[clamp(1rem,2.6svh,1.6rem)]"
              style={{ fontFamily: SANS, fontSize: "clamp(15px, 4.2cqw, 17px)", lineHeight: 1.6, color: p.text, marginBottom: 0, maxWidth: "34ch" }}
            >
              Together with our families, we would be glad to have you beside us as we marry.
            </motion.p>

            {(date.long || locality || date.date) && (
              <motion.div
                {...rise(4)}
                className="order-3 mt-[clamp(0.9rem,2.4svh,1.5rem)] lg:order-4 lg:mt-[clamp(1.1rem,3.2svh,2rem)] px-[0.95rem] pb-[0.8rem] pt-[0.35rem] lg:w-[min(100%,31rem)] lg:px-5 lg:pb-4 lg:pt-2"
                style={{ background: p.sheet, border: hair(45), outline: hair(18), outlineOffset: -5 }}
              >
                <dl style={{ margin: 0 }}>
                  {[date.long ? ["Date", date.long] : null, locality ? ["Locality", locality] : null]
                    .filter((r): r is string[] => Boolean(r))
                    .map(([k, v], i) => (
                      <div key={k} className="py-[0.4rem] lg:py-[0.45rem]" style={{ display: "flex", gap: "0.7rem", borderTop: i ? hair(22) : "none" }}>
                        <dt style={{ ...labelText(lp, 10), flex: "0 0 3.9rem", paddingTop: 3 }}>{k}</dt>
                        <dd className="text-[12.5px] lg:text-[14px]" style={{ fontFamily: MONO, lineHeight: 1.45, color: p.text, margin: 0 }}>{v}</dd>
                      </div>
                    ))}
                </dl>
                {date.date && (
                  <div style={{ borderTop: hair(22), paddingTop: "0.55rem" }}>
                    <p className="hidden lg:block" style={{ ...labelText(lp, 10), margin: "0 0 0.55rem" }}>Until we gather</p>
                    <Countdown target={date.date} palette={lp} />
                  </div>
                )}
              </motion.div>
            )}

            {(showRsvpLink || showGuestbookLink) && (
              <motion.div {...rise(5)} className="order-5 mt-7 flex flex-wrap gap-3 lg:mt-[clamp(1.1rem,3.2svh,2rem)]">
                {showRsvpLink && (
                  <a href="#rsvp" className="transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4" style={link(true)}>
                    Reply
                  </a>
                )}
                {showGuestbookLink && (
                  <a href="#guestbook" className="transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4" style={link(false)}>
                    Leave a note
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="contents lg:hidden">
        <Sprig which={1} width="30cqw" rotate={-142} style={{ right: "-12%", top: "58%", maxWidth: 180, opacity: 0.8 }} />
      </div>
    </header>
  );
}
