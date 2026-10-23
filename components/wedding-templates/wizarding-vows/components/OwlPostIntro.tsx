"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { DateParts, Palette } from "../theme";
import { BOOK, CAPS, DISPLAY, QUILL, SEPIA, agedPaperEdges, agedPaperStyle, capsLabel, kraftStyle, monogram, slateStyle } from "../theme";
import DateRow from "./DateRow";
import DriedSpray from "./DriedFlowers";
import { Crest, OwlStamp, WaxSeal } from "./Emblems";

interface Props {
  palette: Palette;
  partner1: string;
  partner2: string;
  date: DateParts;
  venueName: string;
  venueCity: string;
  /** First time on the programme, shown beside the date on the letter. */
  time?: string;
  /** Personal note for the viewing guest; open invitations are addressed to every witch and wizard. */
  greeting: { name: string; message: string } | null;
  onOpen: () => void;
}

type Phase = "sealed" | "opening" | "letter";

const EASE = [0.65, 0, 0.35, 1] as const;
/** Envelope width: wide on a phone, capped on a desktop, and short enough to leave room for the hint. cq units resolve against the overlay. */
const ENVELOPE_W = "min(86cqw, 24rem, calc((100cqh - 10rem) * 1.42))";

/**
 * Owl post, kept quiet: a kraft envelope rises out of soft focus among dried
 * grasses on charcoal, an owl stamp in the corner and the guest's name in
 * sepia quill. Breaking the wax seal lifts it away, the envelope dissolves and
 * the aged letter rises into place: "Calling all Witches & Wizards", the
 * four-house crest, and a place reserved at the wedding.
 */
export default function OwlPostIntro({ palette: p, partner1, partner2, date, venueName, venueCity, time, greeting, onOpen }: Props) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("sealed");
  // The seal only breaks once the envelope has landed; with reduced motion it arrives already settled.
  const [landed, setLanded] = useState(Boolean(reduce));
  const initials = monogram(partner1, partner2);

  useEffect(() => {
    if (phase !== "opening") return;
    const id = setTimeout(() => setPhase("letter"), 700);
    return () => clearTimeout(id);
  }, [phase]);

  const opening = phase === "opening";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${partner1} & ${partner2} invitation`}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      style={{
        ...slateStyle(p),
        position: "fixed",
        inset: 0,
        // The marketplace preview bar sits at the bottom; stop above it so the buttons stay tappable.
        bottom: "var(--preview-chrome-bottom, 0px)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // Children centre themselves with auto margins, so a letter taller than the screen scrolls instead of losing its top.
        padding: "1.5rem 1.1rem",
        overflowX: "hidden",
        overflowY: "auto",
        containerType: "size",
      }}
    >
      <p aria-live="polite" className="sr-only">{opening ? "Opening your letter" : phase === "letter" ? "Your letter is open" : ""}</p>

      <motion.div
        aria-hidden
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, ease: "easeOut" }}
        style={{ position: "absolute", left: 0, bottom: 0, width: "min(60cqw, 24rem)", pointerEvents: "none" }}
      >
        <DriedSpray tone="light" eager style={{ width: "100%" }} />
      </motion.div>
      <motion.div
        aria-hidden
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, delay: 0.3, ease: "easeOut" }}
        style={{ position: "absolute", right: 0, top: 0, width: "min(54cqw, 21rem)", rotate: 180, pointerEvents: "none" }}
      >
        <DriedSpray tone="light" eager style={{ width: "100%" }} />
      </motion.div>

      <AnimatePresence mode="wait">
        {phase !== "letter" ? (
          <motion.div
            key="envelope"
            initial={reduce ? false : { y: 18, opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.985, filter: "blur(3px)", transition: { duration: 0.8, ease: EASE } }}
            transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setLanded(true)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, margin: "auto 0" }}
          >
            <Envelope
              palette={p}
              initials={initials}
              opening={opening}
              address={
                greeting
                  ? [greeting.name, "The Best Seat in the Great Hall", venueName, venueCity]
                  : ["To Every Witch & Wizard", `Summoned by ${partner1} & ${partner2}`, venueName, venueCity]
              }
              roman={date.roman}
              onBreak={() => {
                if (landed || reduce) setPhase(reduce ? "letter" : "opening");
              }}
            />
            <motion.p
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: opening ? 0 : 1 }}
              transition={{ duration: 1.2, delay: opening ? 0 : 1.4 }}
              style={{ fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(17px, 4.6cqw, 20px)", lineHeight: 1.5, color: p.chalk, textAlign: "center", margin: "2.4rem 0 0", maxWidth: "20rem" }}
            >
              An owl has brought you a letter.
              <span style={{ display: "block", ...capsLabel(p.giltSoft, 12), fontStyle: "normal", marginTop: "0.6rem" }}>Break the seal to open it</span>
            </motion.p>
          </motion.div>
        ) : (
          <Letter key="letter" palette={p} partner1={partner1} partner2={partner2} initials={initials} date={date} venueName={venueName} venueCity={venueCity} time={time} greeting={greeting} onOpen={onOpen} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface EnvelopeProps {
  palette: Palette;
  initials: string;
  opening: boolean;
  address: string[];
  roman: string;
  onBreak: () => void;
}

/** The envelope: kraft paper, an owl stamp and postmark, the address in sepia quill and the wax seal. */
function Envelope({ palette: p, initials, opening, address, roman, onBreak }: EnvelopeProps) {
  const reduce = useReducedMotion();
  const lines = address.filter(Boolean);

  return (
    <div style={{ width: ENVELOPE_W, aspectRatio: "1.42", containerType: "inline-size" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 3, boxShadow: "0 30px 50px -18px rgba(0,0,0,.65), 0 2px 4px rgba(0,0,0,.25)", ...kraftStyle(), padding: "9cqw 8cqw 0" }}>
        {/* Owl-post stamp, slightly askew, and a postmark struck half over it */}
        <OwlStamp style={{ position: "absolute", top: "5cqw", right: "6cqw", width: "15cqw", height: "auto", transform: "rotate(3deg)" }} />
        <div aria-hidden style={{ position: "absolute", top: "9cqw", right: "16cqw", width: "17cqw", aspectRatio: "1", borderRadius: "50%", border: "1.5px solid rgba(40,24,10,.5)", display: "grid", placeItems: "center", transform: "rotate(-12deg)" }}>
          <span style={{ fontFamily: CAPS, fontWeight: 700, fontSize: "2.1cqw", lineHeight: 1.3, letterSpacing: "0.1em", textAlign: "center", color: "rgba(40,24,10,.58)" }}>
            OWL POST
            <br />
            {roman.split(" · ").slice(0, 2).join(" · ")}
          </span>
        </div>

        <address style={{ fontStyle: "normal", color: SEPIA, maxWidth: "62cqw", marginTop: "5cqw", maxHeight: "44cqw", overflow: "hidden" }}>
          {lines.map((line, i) => (
            <span
              key={i}
              style={{
                display: "block",
                fontFamily: QUILL,
                fontSize: i === 0 ? "clamp(1.2rem, 6.8cqw, 1.9rem)" : "clamp(0.95rem, 4.7cqw, 1.3rem)",
                lineHeight: 1.18,
                paddingLeft: `${i * 2.5}cqw`,
                overflowWrap: "anywhere",
              }}
            >
              {line}
            </span>
          ))}
        </address>

        <motion.button
          type="button"
          autoFocus
          onClick={onBreak}
          aria-label="Break the seal and open your letter"
          initial={false}
          animate={opening && !reduce ? { y: -8, scale: 1.04, opacity: 0 } : { y: 0, scale: 1, opacity: 1 }}
          whileHover={reduce || opening ? undefined : { scale: 1.03 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ position: "absolute", left: "50%", bottom: "-7cqw", width: "22cqw", aspectRatio: "1", marginLeft: "-11cqw", border: 0, padding: 0, background: "transparent", borderRadius: "50%", cursor: "pointer", outlineColor: p.giltSoft }}
        >
          <WaxSeal wax={p.wax} initials={initials} style={{ width: "100%", height: "100%" }} />
        </motion.button>
      </div>
    </div>
  );
}

interface LetterProps {
  palette: Palette;
  partner1: string;
  partner2: string;
  initials: string;
  date: DateParts;
  venueName: string;
  venueCity: string;
  time?: string;
  greeting: { name: string; message: string } | null;
  onOpen: () => void;
}

/**
 * The letter itself, unfolded: an old, stained sheet in sepia ink with the
 * crest, the summons, the date set between rules, and a place reserved in the
 * guest's name.
 */
function Letter({ palette: p, partner1, partner2, initials, date, venueName, venueCity, time, greeting, onOpen }: LetterProps) {
  const reduce = useReducedMotion();
  const label = `${partner1} & ${partner2}`.toUpperCase();
  const faded = `color-mix(in srgb, ${SEPIA} 72%, transparent)`;
  const line = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 22, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...agedPaperStyle(),
        position: "relative",
        width: "min(92cqw, 30rem)",
        flexShrink: 0,
        margin: "auto 0",
        padding: "clamp(1.4rem, 4cqh, 2.2rem) clamp(1.2rem, 6cqw, 2.4rem) clamp(1.4rem, 4cqh, 2rem)",
        textAlign: "center",
        borderRadius: 2,
        boxShadow: `${agedPaperEdges}, 0 30px 60px -20px rgba(0,0,0,.8)`,
      }}
    >
      <motion.p {...line(0.15)} style={{ margin: 0, lineHeight: 1 }}>
        <span style={{ display: "block", ...capsLabel(SEPIA, 14), fontWeight: 700 }}>Calling all</span>
        <span style={{ display: "block", fontFamily: DISPLAY, fontWeight: 500, fontSize: "clamp(1.6rem, 7.6cqw, 2.4rem)", lineHeight: 1.1, letterSpacing: "0.04em", color: SEPIA, marginTop: "0.3rem" }}>
          Witches <span style={{ fontFamily: QUILL, fontWeight: 400, color: p.wax }}>&amp;</span> Wizards
        </span>
      </motion.p>

      <motion.div {...line(0.35)} style={{ margin: "0.9rem 0 0" }}>
        <Crest
          initials={initials}
          gilt={p.gilt}
          wax={p.wax}
          label={label.length <= 18 ? label : undefined}
          title={`Crest of ${partner1} and ${partner2}`}
          style={{ height: "min(22cqh, 9.5rem)", width: "auto", display: "block", margin: "0 auto", filter: "sepia(.55) saturate(.7) contrast(.95)" }}
        />
      </motion.div>

      <motion.div {...line(0.6)} style={{ margin: "0.9rem auto 0", maxWidth: "24rem" }}>
        {greeting && (
          <p style={{ fontFamily: QUILL, fontSize: "clamp(1.45rem, 6.2cqw, 1.85rem)", lineHeight: 1.15, color: SEPIA, margin: "0 0 0.25rem", overflowWrap: "anywhere" }}>Dear {greeting.name},</p>
        )}
        {greeting?.message && (
          <p style={{ fontFamily: BOOK, fontStyle: "italic", fontSize: "clamp(15px, 4.1cqw, 17px)", lineHeight: 1.45, color: faded, margin: "0 0 0.5rem" }}>{greeting.message}</p>
        )}
        <p style={{ ...capsLabel(faded, 11), fontWeight: 700, margin: 0 }}>· A place is reserved for you at the wedding of ·</p>
      </motion.div>

      <motion.h2 {...line(0.8)} style={{ fontFamily: DISPLAY, fontWeight: 500, letterSpacing: "0.04em", fontSize: "clamp(1.6rem, 8.2cqw, 2.5rem)", lineHeight: 1.1, color: SEPIA, margin: "0.45rem 0 0", overflowWrap: "anywhere" }}>
        {partner1} <span style={{ fontFamily: QUILL, fontWeight: 400, color: p.wax }}>&amp;</span> {partner2}
      </motion.h2>

      <motion.div {...line(1)} style={{ marginTop: "1rem" }}>
        <DateRow date={date} time={time} color={SEPIA} rule={`color-mix(in srgb, ${SEPIA} 70%, transparent)`} />
      </motion.div>

      {(venueName || venueCity) && (
        <motion.p {...line(1.15)} style={{ ...capsLabel(SEPIA, 11), fontWeight: 700, lineHeight: 1.7, margin: "1rem 0 0" }}>
          {venueName}
          {venueName && venueCity && <br />}
          <span style={{ color: faded }}>{venueCity}</span>
        </motion.p>
      )}

      <motion.div {...line(1.3)} aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", margin: "0.9rem 0 0", color: SEPIA }}>
        <span style={{ width: "4.5rem", height: 1, background: SEPIA }} />
        <span style={{ fontSize: 12 }}>✶</span>
        <span style={{ width: "4.5rem", height: 1, background: SEPIA }} />
      </motion.div>

      <motion.p {...line(1.4)} style={{ fontFamily: BOOK, fontStyle: "italic", fontSize: 16, color: faded, margin: "0.7rem 0 0" }}>
        Yours sincerely,
        <span style={{ display: "block", fontFamily: QUILL, fontStyle: "normal", fontSize: "clamp(1.45rem, 6cqw, 1.85rem)", lineHeight: 1.2, color: SEPIA }}>
          {partner1} &amp; {partner2}
        </span>
      </motion.p>

      <motion.button
        {...line(1.6)}
        type="button"
        autoFocus
        onClick={onOpen}
        whileHover={reduce ? undefined : { y: -2 }}
        className="focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{
          marginTop: "1.2rem",
          minHeight: 52,
          padding: "0 1.8rem",
          borderRadius: 2,
          border: 0,
          background: SEPIA,
          color: "#EFE4CC",
          fontFamily: CAPS,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          cursor: "pointer",
          boxShadow: `inset 0 0 0 3px ${SEPIA}, inset 0 0 0 4px rgba(239,228,204,.45)`,
          outlineColor: SEPIA,
        }}
      >
        Enter the Great Hall
      </motion.button>
    </motion.article>
  );
}
