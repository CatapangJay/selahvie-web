"use client";

import { Fragment, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { BOOK, CAPS, DISPLAY, QUILL, capsLabel, cssImage, giltFrame, slateStyle } from "../theme";
import DateRow from "./DateRow";
import DriedSpray from "./DriedFlowers";
import { EASE } from "./Motion";

export interface NavLink {
  href: string;
  label: string;
}

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** First time on the programme, set beside the date. */
  time?: string;
  /** The letter has been opened; the entrance plays from here. */
  opened: boolean;
  /** Personal note for the viewing guest, printed on a platform ticket. */
  greeting?: { name: string; message: string } | null;
  /** Links to the sections this guest can see. */
  links: NavLink[];
}

/** Names large enough to hold the page, small enough that the longer one never breaks. */
function nameSize(p1: string, p2: string): string {
  const len = Math.max(5, p1.trim().length, p2.trim().length);
  return `clamp(2.3rem, min(13cqw, ${(104 / len).toFixed(1)}cqw), 4.6rem)`;
}

/**
 * The invitation proper, chalked on charcoal: dried flowers in the corners, a
 * slowly breathing portrait in a hairline gold arch, the names in engraved
 * capitals, the date set between rules, a quiet countdown, a platform ticket
 * for the guest and the way to each part of the invitation.
 */
export default function HeroSection({ config, palette: p, date, time, opened, greeting, links }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const show = opened || Boolean(reduce);
  const names = `${config.partner1Name} & ${config.partner2Name}`;
  const image = cssImage(config.heroImageUrl);
  const rule = `color-mix(in srgb, ${p.gilt} 60%, transparent)`;

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0 },
    animate: show ? { opacity: 1 } : undefined,
    transition: { duration: 2.2, delay, ease: "easeOut" as const },
  });
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.1, delay, ease: EASE },
  });

  return (
    <header ref={ref} aria-labelledby="wv-hero-title" style={{ ...slateStyle(p), containerType: "inline-size", position: "relative", overflow: "hidden", textAlign: "center" }}>
      {/* Dried grasses on the diagonal: hanging in from the top left, rising from the lower right */}
      <motion.div {...fade(0.1)} aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "min(32cqw, 12.5rem)", rotate: 180 }}>
        <DriedSpray tone="light" eager flip />
      </motion.div>
      <motion.div {...fade(0.3)} aria-hidden style={{ position: "absolute", bottom: 0, right: 0, width: "min(34cqw, 13rem)" }}>
        <DriedSpray tone="light" flip />
      </motion.div>

      <div style={{ position: "relative", padding: "min(44cqw, 17rem) 1.4rem min(46cqw, 17.5rem)", maxWidth: 640, margin: "0 auto" }}>
        <motion.p {...rise(0.35)} style={{ ...capsLabel(p.gilt, 12), fontWeight: 700, margin: 0 }}>
          You are summoned to the wedding of
        </motion.p>

        <motion.div {...rise(0.55)} style={{ width: "min(60cqw, 17.5rem)", margin: "2rem auto 0" }}>
          <motion.div style={{ ...giltFrame(p, 7), y: reduce ? 0 : portraitY, borderRadius: "50% 50% 4px 4px / 32% 32% 4px 4px" }}>
            <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: "50% 50% 2px 2px / 32% 32% 2px 2px", background: p.slateSoft }}>
              {/* A living portrait: the photograph breathes, drifting slowly as if about to step out of the frame. */}
              <motion.div
                {...(image ? { role: "img", "aria-label": `${names} portrait` } : { "aria-hidden": true })}
                animate={reduce ? undefined : { scale: [1.04, 1.1, 1.04], x: ["0%", "-1.5%", "0%"] }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0, backgroundImage: image, backgroundSize: "cover", backgroundPosition: "center", filter: "saturate(.85) sepia(.12)" }}
              />
            </div>
          </motion.div>
        </motion.div>

        <h1
          id="wv-hero-title"
          aria-label={names}
          style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: nameSize(config.partner1Name, config.partner2Name), lineHeight: 1.05, letterSpacing: "0.06em", textTransform: "uppercase", color: p.chalk, margin: "2.4rem 0 0", overflowWrap: "anywhere" }}
        >
          <motion.span {...rise(0.85)} style={{ display: "block" }}>{config.partner1Name}</motion.span>
          <motion.span {...rise(1)} aria-hidden style={{ display: "block", fontFamily: QUILL, textTransform: "none", letterSpacing: 0, fontSize: "0.72em", lineHeight: 1.05, color: p.gilt }}>&amp;</motion.span>
          <motion.span {...rise(1.1)} style={{ display: "block" }}>{config.partner2Name}</motion.span>
        </h1>

        {(date.long || config.venueName) && (
          <motion.div {...rise(1.35)} style={{ marginTop: "2rem" }}>
            <p style={{ ...capsLabel(p.gilt, 11), fontWeight: 700, margin: "0 0 1.1rem" }}>· Join us as we say our vows ·</p>
            <DateRow date={date} time={time} color={p.chalk} accent={p.gilt} rule={rule} />
            {(config.venueName || config.venueCity) && (
              <p style={{ ...capsLabel(p.chalk, 12), fontWeight: 700, lineHeight: 1.8, margin: "1.3rem auto 0", maxWidth: "24rem" }}>
                {config.venueName}
                {config.venueName && config.venueCity && <br />}
                <span style={{ color: `color-mix(in srgb, ${p.chalk} 70%, transparent)` }}>{config.venueCity}</span>
              </p>
            )}
            <Divider color={p.gilt} />
          </motion.div>
        )}

        {date.date && (
          <motion.div {...rise(1.6)} style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
            <Countdown target={date.date} palette={p} />
          </motion.div>
        )}

        {greeting && (
          <motion.div {...rise(1.85)} role="note" aria-label={`Invitation for ${greeting.name}`} style={{ margin: "2.8rem auto 0", maxWidth: "23rem" }}>
            <PlatformTicket palette={p} greeting={greeting} />
          </motion.div>
        )}

        {links.length > 0 && (
          <motion.nav {...rise(2)} aria-label="Invitation sections" style={{ marginTop: "3rem" }}>
            <ul style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "0.2rem 0.9rem", listStyle: "none", padding: 0, margin: 0 }}>
              {links.map((link, i) => (
                <Fragment key={link.href}>
                  {i > 0 && (
                    <li aria-hidden style={{ color: p.gilt, fontSize: 10 }}>
                      ✶
                    </li>
                  )}
                  <li>
                    <a
                      href={link.href}
                      className="inline-flex min-h-11 items-center underline-offset-[6px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                      style={{ ...capsLabel(p.chalk, 12), textDecorationColor: p.gilt, outlineColor: p.gilt }}
                    >
                      {link.label}
                    </a>
                  </li>
                </Fragment>
              ))}
            </ul>
          </motion.nav>
        )}
      </div>
    </header>
  );
}

/** A short hairline either side of a small star. */
export function Divider({ color, style }: { color: string; style?: CSSProperties }) {
  return (
    <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", margin: "1.3rem 0 0", color, ...style }}>
      <span style={{ width: "4.5rem", height: 1, background: color }} />
      <span style={{ fontSize: 11 }}>✶</span>
      <span style={{ width: "4.5rem", height: 1, background: color }} />
    </div>
  );
}

/** A ticket from platform nine and three-quarters, set in gold on charcoal, with the guest's name in quill. */
function PlatformTicket({ palette: p, greeting }: { palette: Palette; greeting: { name: string; message: string } }) {
  const line = `1px solid color-mix(in srgb, ${p.gilt} 70%, transparent)`;
  return (
    <div style={{ display: "flex", textAlign: "left", background: p.slateSoft, border: line, boxShadow: "0 18px 30px -22px rgba(0,0,0,.8)" }}>
      <div style={{ flex: 1, minWidth: 0, padding: "1rem 1.15rem 1.05rem" }}>
        <p style={{ ...capsLabel(p.gilt, 10), fontWeight: 700, paddingLeft: 0, margin: 0 }}>Platform 9¾ · Admit</p>
        <p style={{ fontFamily: QUILL, fontSize: 30, lineHeight: 1.15, color: p.chalk, margin: "0.25rem 0 0", overflowWrap: "anywhere" }}>{greeting.name}</p>
        <p style={{ fontFamily: BOOK, fontStyle: "italic", fontSize: 17, lineHeight: 1.45, color: `color-mix(in srgb, ${p.chalk} 78%, transparent)`, margin: "0.2rem 0 0" }}>{greeting.message}</p>
      </div>
      <div aria-hidden style={{ width: 54, borderLeft: `1px dashed color-mix(in srgb, ${p.gilt} 70%, transparent)`, display: "grid", placeItems: "center" }}>
        <span style={{ writingMode: "vertical-rl", ...capsLabel(p.gilt, 10), paddingLeft: 0, fontWeight: 700 }}>No. 9¾</span>
      </div>
    </div>
  );
}

const subscribe = (onTick: () => void) => {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
// Server render shows dashes, so hydration never disagrees with the clock.
const serverSeconds = () => null;

const DAY = 86_400;

/** Days, hours, minutes and seconds in engraved numerals, divided by hairlines. */
function Countdown({ target, palette: p }: { target: Date; palette: Palette }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const left = now === null ? null : Math.floor(target.getTime() / 1000) - now;

  if (left !== null && left <= 0) {
    return (
      <p style={{ fontFamily: QUILL, fontSize: "clamp(2rem, 9cqw, 2.8rem)", color: p.gilt, margin: 0 }}>
        {left <= -DAY ? "Happily wed" : "Today we say I do"}
      </p>
    );
  }

  const units = [
    { label: "Days", value: left === null ? null : Math.floor(left / DAY) },
    { label: "Hours", value: left === null ? null : Math.floor((left % DAY) / 3600) },
    { label: "Minutes", value: left === null ? null : Math.floor((left % 3600) / 60) },
    { label: "Seconds", value: left === null ? null : left % 60 },
  ];
  const spoken = left === null ? undefined : `${units[0].value} days, ${units[1].value} hours and ${units[2].value} minutes until the wedding`;

  return (
    <div role="timer" aria-label={spoken} style={{ width: "min(100%, 22rem)" }}>
      <p aria-hidden style={{ fontFamily: QUILL, fontSize: 26, lineHeight: 1, color: p.gilt, margin: "0 0 0.9rem" }}>Until we say I do</p>
      <div aria-hidden style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {units.map((u, i) => (
          <div key={u.label} style={{ padding: "0.2rem", borderLeft: i ? `1px solid color-mix(in srgb, ${p.gilt} 45%, transparent)` : "none" }}>
            <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(24px, 7cqw, 32px)", lineHeight: 1.1, color: p.chalk, fontVariantNumeric: "tabular-nums" }}>
              {u.value === null ? "--" : String(u.value).padStart(2, "0")}
            </span>
            <span style={{ display: "block", fontFamily: CAPS, fontWeight: 600, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: p.giltSoft, marginTop: 4 }}>{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
