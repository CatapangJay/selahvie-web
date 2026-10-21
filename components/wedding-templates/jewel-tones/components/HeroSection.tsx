"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { SCRIPT, SERIF, feltStyle, initialOf, paperStyle } from "../theme";
import GiltFrame from "./GiltFrame";
import CalaLily from "./CalaLily";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  /** The envelope has been opened; hero entrance plays from here. */
  opened: boolean;
  showRsvp: boolean;
  /** Personal note for the viewing guest, set as a place card above the invitation. */
  greeting?: { name: string; message: string } | null;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 18 } },
};

export default function HeroSection({ config, palette: p, date, opened, showRsvp, greeting }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const venueLine = [config.venueName, config.venueCity].filter(Boolean).join(" · ");

  return (
    <section
      ref={ref}
      aria-labelledby="jt-hero-title"
      style={{
        ...feltStyle(p.raspberry, p.raspberryDeep),
        position: "relative",
        overflow: "hidden",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        paddingInline: "clamp(1.25rem, 5vw, 2.5rem)",
        // Phones lead with the portrait, so they need far less headroom than the two-column layout.
        paddingTop: "clamp(3rem, 14vw - 2rem, 11rem)",
        paddingBottom: "clamp(4rem, 10vh, 6rem)",
      }}
    >
      {/* Warm light behind the portrait */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(40rem 32rem at 70% 50%, ${p.gold}33, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Calla lilies swaying in the corners */}
      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          aria-hidden
          initial={{ opacity: 0, y: 40 }}
          animate={opened ? { opacity: 1, y: 0, rotate: side === "left" ? [-10, -6, -10] : [10, 6, 10] } : { opacity: 0, y: 40 }}
          transition={{
            opacity: { duration: 1, delay: 0.5 },
            y: { type: "spring", stiffness: 50, damping: 16, delay: 0.5 },
            rotate: { duration: 8, ease: "easeInOut", repeat: Infinity },
          }}
          style={{
            position: "absolute",
            bottom: "-1.5rem",
            left: side === "left" ? "clamp(-1rem, 2vw, 3rem)" : undefined,
            right: side === "right" ? "clamp(-1rem, 2vw, 3rem)" : undefined,
            width: "clamp(3.25rem, 8vw, 7rem)",
            transformOrigin: "50% 100%",
            scaleX: side === "right" ? -1 : 1,
            pointerEvents: "none",
          }}
        >
          <CalaLily />
        </motion.div>
      ))}

      <motion.div
        variants={container}
        initial="hidden"
        animate={opened ? "show" : "hidden"}
        className="relative mx-auto grid w-full items-center md:grid-cols-2"
        style={{ maxWidth: "70rem", gap: "clamp(2.5rem, 6vw, 5rem)", zIndex: 1 }}
      >
        <div className="text-center">
          {greeting && (
            <motion.div variants={item} style={{ marginBottom: "clamp(1.75rem, 4vw, 2.5rem)" }}>
              <PlaceCard greeting={greeting} palette={p} />
            </motion.div>
          )}
          <motion.p
            variants={item}
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "clamp(1.1rem, 2.6vw, 1.4rem)",
              color: p.goldLight,
            }}
          >
            Together with their families
          </motion.p>

          <motion.h1
            id="jt-hero-title"
            variants={item}
            style={{
              fontFamily: SCRIPT,
              fontWeight: 400,
              fontSize: "clamp(3.4rem, 11vw, 6.4rem)",
              lineHeight: 1.02,
              color: p.cream,
              marginTop: "0.6rem",
              textShadow: "0 3px 24px rgba(0,0,0,.35)",
              overflowWrap: "anywhere",
            }}
          >
            <span className="block">{config.partner1Name}</span>
            <span
              aria-hidden
              className="block"
              style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "0.34em", lineHeight: 1.5, color: p.goldLight }}
            >
              &amp;
            </span>
            <span className="sr-only"> and </span>
            <span className="block">{config.partner2Name}</span>
          </motion.h1>

          <motion.div variants={item} aria-hidden className="mx-auto my-6 flex items-center justify-center gap-3">
            <span style={{ height: 1, width: "3.5rem", background: `linear-gradient(90deg, transparent, ${p.gold})` }} />
            <span style={{ width: 8, height: 8, transform: "rotate(45deg)", background: p.gold }} />
            <span style={{ height: 1, width: "3.5rem", background: `linear-gradient(270deg, transparent, ${p.gold})` }} />
          </motion.div>

          <motion.p
            variants={item}
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: "clamp(1.1rem, 2.6vw, 1.35rem)",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: p.cream,
            }}
          >
            {date.long}
          </motion.p>
          {venueLine && (
            <motion.p
              variants={item}
              style={{ fontFamily: SERIF, fontSize: "clamp(1.1rem, 2.4vw, 1.3rem)", color: p.goldLight, marginTop: "0.5rem" }}
            >
              {venueLine}
            </motion.p>
          )}

          {showRsvp && (
            <motion.div variants={item} style={{ marginTop: "2.25rem" }}>
              <a
                href="#rsvp"
                className="inline-flex min-h-12 items-center justify-center px-8 transition-colors hover:bg-[rgba(243,220,154,.16)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3dc9a]"
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: p.goldLight,
                  border: `1px solid ${p.gold}`,
                  borderRadius: 2,
                }}
              >
                Kindly Reply
              </a>
            </motion.div>
          )}
        </div>

        <motion.div variants={item} className="order-first mx-auto w-full md:order-none" style={{ maxWidth: "min(72vw, 24rem)" }}>
          {/* Mobile masthead: the portrait leads, so the top of the card carries the date. */}
          {date.dotted && (
            <div aria-hidden className="mb-6 flex items-center justify-center gap-3 md:hidden">
              <span style={{ height: 1, flex: 1, maxWidth: "3.5rem", background: `linear-gradient(90deg, transparent, ${p.gold})` }} />
              <span style={{ width: 6, height: 6, transform: "rotate(45deg)", background: p.gold }} />
              <span
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  letterSpacing: "0.32em",
                  paddingLeft: "0.32em",
                  color: p.goldLight,
                  whiteSpace: "nowrap",
                }}
              >
                {date.dotted}
              </span>
              <span style={{ width: 6, height: 6, transform: "rotate(45deg)", background: p.gold }} />
              <span style={{ height: 1, flex: 1, maxWidth: "3.5rem", background: `linear-gradient(270deg, transparent, ${p.gold})` }} />
            </div>
          )}
          <GiltFrame palette={p} shape="arch" ratio="4 / 5.2">
            {config.heroImageUrl ? (
              <motion.div style={{ position: "absolute", inset: 0, y: reduce ? 0 : imageY, scale: 1.18 }}>
                <Image
                  src={config.heroImageUrl}
                  alt={`${config.partner1Name} and ${config.partner2Name}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 72vw, 384px"
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ position: "absolute", inset: 0, fontFamily: SCRIPT, fontSize: "5rem", color: p.raspberryDeep }}
              >
                {initialOf(config.partner1Name)}&amp;{initialOf(config.partner2Name)}
              </div>
            )}
          </GiltFrame>
        </motion.div>
      </motion.div>
    </section>
  );
}

/** Escort-card greeting: cream stock, gilt inner rule, the guest's name in script. */
function PlaceCard({ greeting, palette: p }: { greeting: { name: string; message: string }; palette: Palette }) {
  return (
    <div
      role="note"
      aria-label={`Invitation for ${greeting.name}`}
      className="relative mx-auto text-center"
      style={{
        ...paperStyle(p.cream, p.creamDeep),
        maxWidth: "min(100%, 23rem)",
        padding: "0.45rem",
        transform: "rotate(-1.5deg)",
        boxShadow: "0 18px 32px -14px rgba(0,0,0,.55), 0 3px 8px rgba(0,0,0,.2)",
        color: p.ink,
      }}
    >
      <div style={{ border: `1px solid ${p.gold}`, padding: "clamp(0.9rem, 2.5vw, 1.15rem) clamp(1.25rem, 4vw, 2rem) clamp(1rem, 2.5vw, 1.25rem)" }}>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.05rem", lineHeight: 1.2, color: p.goldInk }}>Dear</p>
        <p
          style={{
            fontFamily: SCRIPT,
            fontSize: "clamp(1.75rem, 4.6vw, 2.15rem)",
            lineHeight: 1.15,
            color: p.raspberryDeep,
            overflowWrap: "anywhere",
            textWrap: "balance",
          }}
        >
          {greeting.name},
        </p>
        <div aria-hidden className="mx-auto my-2 flex items-center justify-center gap-2">
          <span style={{ height: 1, width: "2rem", background: `linear-gradient(90deg, transparent, ${p.gold})` }} />
          <span style={{ width: 5, height: 5, transform: "rotate(45deg)", background: p.gold }} />
          <span style={{ height: 1, width: "2rem", background: `linear-gradient(270deg, transparent, ${p.gold})` }} />
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(1.05rem, 2.4vw, 1.2rem)", lineHeight: 1.45, textWrap: "pretty" }}>
          {greeting.message}
        </p>
      </div>
    </div>
  );
}
