"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";
import { Sprig } from "./Ornaments";

interface Props {
  palette: Palette;
  partner1: string;
  partner2: string;
  date: DateParts;
  /** Personal note for the viewing guest; open invitations get a general tag. */
  greeting: { name: string; message: string } | null;
  /** Sections the welcome note points to ("our story", "a few favourite photos"…), in page order. */
  highlights: string[];
  /** The RSVP section is on the page, so the note can ask guests to reply. */
  canReply: boolean;
  onOpen: () => void;
}

/** "a, b and c" */
function listOf(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** The welcome note's invitation to look around, shaped by what the couple has filled in. */
function lookAround(highlights: string[], canReply: boolean): string {
  const look = highlights.length > 0 ? `Take a look at ${listOf(highlights)}` : "Take a look around";
  return canReply ? `${look}, then let us know you'll be there.` : `${look}. We can't wait to celebrate with you.`;
}

const EASE = [0.22, 1, 0.36, 1] as const;
// Florist's tag: rectangle with the two top corners clipped.
const TAG_SHAPE = "polygon(18% 0, 82% 0, 100% 13%, 100% 100%, 0 100%, 0 13%)";

/**
 * A florist's gift tag tied on with ribbon, written out to the guest. One tap
 * unties the bow and the tag turns over to a welcome note from the couple; the
 * guest steps inside when they've read it.
 */
export default function GiftTagIntro({ palette: p, partner1, partner2, date, greeting, highlights, canReply, onOpen }: Props) {
  const reduce = useReducedMotion();
  const [untied, setUntied] = useState(false);
  // The note is face up and the button has become "Take a look inside".
  const [turned, setTurned] = useState(false);

  useEffect(() => {
    if (!untied) return;
    const id = setTimeout(() => setTurned(true), reduce ? 0 : 1500);
    return () => clearTimeout(id);
  }, [untied, reduce]);

  const press = () => {
    if (!untied) setUntied(true);
    else if (turned) onOpen();
  };
  const firstName = greeting?.name.split(/\s+/)[0]?.replace(/[,&]+$/, "");
  const note = lookAround(highlights, canReply);

  const face = {
    position: "absolute",
    inset: 0,
    clipPath: TAG_SHAPE,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    background: `linear-gradient(170deg, ${p.butter} 0%, ${p.golden} 100%)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4.75rem 1.75rem 2rem",
    textAlign: "center",
    color: p.ink,
  } as const;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${partner1} & ${partner2} invitation`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.9, ease: EASE } }}
      style={{
        position: "fixed",
        inset: 0,
        // The marketplace preview bar sits at the bottom; stop above it so the open button stays tappable.
        bottom: "var(--preview-chrome-bottom, 0px)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.75rem",
        padding: "1.5rem",
        overflowY: "auto",
        background: `radial-gradient(120% 70% at 50% 100%, ${p.golden} 0%, ${p.morning} 62%)`,
      }}
    >
      <motion.div
        initial={reduce ? false : { y: -30, opacity: 0, rotate: -4 }}
        animate={untied ? { y: 0, opacity: 1, rotate: 0 } : { y: 0, opacity: 1, rotate: [-2.5, 2.5, -2.5] }}
        transition={
          untied
            ? { duration: 0.6, ease: EASE }
            : { y: { duration: 1, ease: EASE }, opacity: { duration: 0.8 }, rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" } }
        }
        // Tapping the tag itself unties it too; the button below is the keyboard and screen-reader path.
        data-gift-tag=""
        onClick={press}
        style={{
          position: "relative",
          width: "min(74vw, 17.5rem, calc((100svh - 13rem) * 0.55))",
          aspectRatio: "5 / 8",
          transformOrigin: "50% 0",
          perspective: 1200,
          marginTop: "4rem",
          cursor: untied && !turned ? "default" : "pointer",
        }}
      >
        {/* Ribbon through the eyelet, with a bow that slips loose when untied */}
        <motion.svg
          aria-hidden
          viewBox="0 0 200 160"
          initial={false}
          animate={untied ? { opacity: 0, y: -60, rotate: -12 } : { opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ position: "absolute", left: "50%", top: "-5.25rem", width: "11rem", marginLeft: "-5.5rem", zIndex: 2, overflow: "visible" }}
        >
          <path d="M100 150 C 96 110, 104 70, 100 30" stroke={p.apricot} strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M100 40 C 70 10, 30 18, 38 42 C 46 64, 84 52, 100 40 Z" fill={p.apricot} />
          <path d="M100 40 C 130 10, 170 18, 162 42 C 154 64, 116 52, 100 40 Z" fill={p.apricot} />
          <path d="M100 40 C 90 70, 70 96, 56 112" stroke={p.apricotDeep} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M100 40 C 112 72, 128 94, 146 110" stroke={p.apricotDeep} strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="100" cy="40" r="9" fill={p.apricotDeep} />
        </motion.svg>

        {/* The shadow lives on this wrapper: a filter on the turning element itself would flatten the 3D
            turn, the back face would never show and the front's writing would read mirrored. */}
        <div style={{ position: "absolute", inset: 0, perspective: 1200, filter: "drop-shadow(0 18px 28px rgba(91,44,58,.22))" }}>
        <motion.div
          initial={false}
          animate={{ rotateY: untied ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : 0.45, ease: EASE }}
          style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
        >
          {/* Front: written out to the guest */}
          <div style={face} aria-hidden={untied || undefined}>
            <Eyelet palette={p} />
            <Sprig color={p.dusk} bloom={p.apricot} style={{ width: "4.25rem", marginBottom: "0.75rem" }} />
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.28em", paddingLeft: "0.28em", textTransform: "uppercase", color: p.apricotDeep, margin: 0 }}>
              {greeting ? "A little something for" : "A little something for you"}
            </p>
            {greeting && (
              <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.7rem, 7.5vw, 2.1rem)", lineHeight: 1.1, margin: "0.6rem 0 0", overflowWrap: "anywhere" }}>
                {greeting.name}
              </p>
            )}
            <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1.5, color: p.ink, opacity: 0.85, margin: "0.9rem 0 0" }}>
              {greeting?.message ?? "Untie the ribbon to open your invitation."}
            </p>
          </div>

          {/* Back: a welcome note in the couple's hand, signed off with their names */}
          <div
            aria-hidden={!untied || undefined}
            style={{ ...face, transform: "rotateY(180deg)", padding: "4.25rem 1.5rem 1.75rem", background: `linear-gradient(170deg, ${p.apricotSoft} 0%, ${p.butter} 100%)` }}
          >
            <Eyelet palette={p} />
            <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.9rem, 8.5vw, 2.4rem)", lineHeight: 1.05, color: p.ink, margin: 0, overflowWrap: "anywhere" }}>
              Welcome{firstName ? `, ${firstName}` : ""}
            </p>
            <p style={{ fontFamily: SANS, fontSize: "clamp(13px, 3.6vw, 15px)", fontWeight: 400, lineHeight: 1.5, color: p.ink, margin: "0.7rem 0 0", textWrap: "balance" }}>
              We&apos;re so glad you&apos;re here.
            </p>
            <span aria-hidden style={{ display: "block", flexShrink: 0, width: "2.5rem", height: 1.5, borderRadius: 2, background: `color-mix(in srgb, ${p.apricot} 60%, transparent)`, margin: "clamp(0.8rem, 3svh, 1.2rem) auto" }} />
            <p style={{ fontFamily: SANS, fontSize: "clamp(13px, 3.6vw, 15px)", fontWeight: 300, lineHeight: 1.55, color: p.ink, margin: 0, textWrap: "pretty" }}>{note}</p>
            <p style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: "clamp(1.05rem, 4.6vw, 1.25rem)", lineHeight: 1.25, color: p.apricotDeep, margin: "clamp(0.9rem, 3svh, 1.3rem) 0 0", overflowWrap: "anywhere" }}>
              With love,
              <span style={{ display: "block", color: p.ink }}>
                {partner1} &amp; {partner2}
              </span>
            </p>
            {date.long && (
              <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", paddingLeft: "0.2em", textTransform: "uppercase", color: p.apricotDeep, margin: "0.6rem 0 0" }}>
                {date.monthDay}
                {date.year && ` · ${date.year}`}
              </p>
            )}
          </div>
        </motion.div>
        </div>
      </motion.div>

      <motion.button
        type="button"
        autoFocus
        // Hidden while the tag turns, then back as the way inside.
        disabled={untied && !turned}
        onClick={press}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: untied && !turned ? 0 : 1, y: 0 }}
        transition={{ duration: 0.6, delay: untied && !turned ? 0 : 0.2, ease: EASE }}
        className="transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{
          minHeight: 50,
          padding: "0 2rem",
          borderRadius: 999,
          border: 0,
          background: p.apricot,
          color: "#fff",
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: "0.12em",
          boxShadow: `0 10px 24px -10px ${p.apricotDeep}`,
          cursor: "pointer",
          outlineColor: p.dusk,
        }}
      >
        {turned ? (
          <>
            Take a look inside <span aria-hidden>→</span>
          </>
        ) : (
          "Untie the ribbon"
        )}
      </motion.button>
      <span className="sr-only" aria-live="polite">
        {turned ? `Welcome${firstName ? `, ${firstName}` : ""}. We're so glad you're here. ${note} With love, ${partner1} and ${partner2}.` : ""}
      </span>
    </motion.div>
  );
}

function Eyelet({ palette: p }: { palette: Palette }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: "1.6rem",
        left: "50%",
        width: 22,
        height: 22,
        marginLeft: -11,
        borderRadius: "50%",
        background: p.morning,
        boxShadow: `inset 0 0 0 4px ${p.golden}, inset 0 2px 3px rgba(0,0,0,.18)`,
      }}
    />
  );
}
