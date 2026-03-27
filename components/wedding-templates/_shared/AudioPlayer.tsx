"use client";

/**
 * Shared ambient music player used by all wedding templates.
 * Driven entirely by WeddingConfig: pass `src` (resolved from config)
 * and it renders a floating toggleable music button.
 * Pass `src={null}` (or don't pass) to suppress the player entirely.
 *
 * Couple + music source → resolveMusicSrc(config) → this component.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Volume2, VolumeX } from "lucide-react";

interface Props {
  /** Resolved audio URL. Null/undefined = player is hidden. */
  src: string | null | undefined;
  /** Accent color for the player UI. Defaults to the design system tertiary gold. */
  accentColor?: string;
}

export default function AudioPlayer({ src, accentColor = "var(--color-tertiary)" }: Props) {
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const [playing,  setPlaying]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  const [hasError, setHasError] = useState(false);

  /* Initialise (or teardown+reinit) whenever src changes */
  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.loop    = true;
    audio.volume  = 0.35;
    audio.preload = "metadata";
    audio.addEventListener("error", () => setHasError(true));
    audioRef.current = audio;

    const t = setTimeout(() => setVisible(true), 1_500);
    return () => {
      clearTimeout(t);
      audio.pause();
      audio.src = "";
      setPlaying(false);
      setVisible(false);
      setHasError(false);
    };
  }, [src]);

  if (!src || hasError) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().catch(() => setHasError(true)); setPlaying(true); }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{    opacity: 0, scale: 0.6          }}
          transition={{ duration: 0.45, ease: "backOut" }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
          role="region"
          aria-label="Background music player"
        >
          {/* "Play Music" label — visible only when paused */}
          <AnimatePresence>
            {!playing && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0  }}
                exit={{    opacity: 0, x: 10  }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: "rgba(10,9,8,0.8)",
                  border: `1px solid ${accentColor}25`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Music size={9} style={{ color: accentColor }} />
                <span
                  className="label-luxury"
                  style={{ color: accentColor, fontSize: "0.58rem", opacity: 0.85 }}
                >
                  Play Ambient Music
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle button */}
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{   scale: 0.9 }}
            aria-label={playing ? "Pause background music" : "Play background music"}
            title={playing ? "Pause music" : "Play ambient music"}
            className="relative flex items-center justify-center w-12 h-12 rounded-full"
            style={{
              background: "rgba(10,9,8,0.85)",
              border: `1px solid ${accentColor}35`,
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            {/* Pulsing ring while playing */}
            {playing && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ border: `1px solid ${accentColor}50` }}
                animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}

            {playing
              ? <Volume2 size={17} style={{ color: accentColor }} />
              : <VolumeX  size={17} style={{ color: accentColor, opacity: 0.55 }} />
            }
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
