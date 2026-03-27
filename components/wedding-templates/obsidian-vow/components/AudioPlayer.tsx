"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, VolumeX, Volume2 } from "lucide-react";

interface Props {
  /**
   * URL of the ambient background track.
   * Place a royalty-free MP3 in /public/music/wedding-ambient.mp3,
   * or pass a hosted URL here. The player will silently fail if the
   * source is unreachable.
   */
  src?: string;
}

const DEFAULT_SRC = "/music/wedding-ambient.mp3";

export default function AudioPlayer({ src = DEFAULT_SRC }: Props) {
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const [playing,  setPlaying]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  const [hasError, setHasError] = useState(false);

  /* Mount audio element lazily so SSR is safe */
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop   = true;
    audio.volume = 0.35;
    audio.preload = "metadata";
    audio.addEventListener("error", () => setHasError(true));
    audioRef.current = audio;

    /* Show the player button after a short delay */
    const t = setTimeout(() => setVisible(true), 1_500);
    return () => {
      clearTimeout(t);
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => setHasError(true));
      setPlaying(true);
    }
  };

  if (hasError) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{    opacity: 0, scale: 0.6          }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="fixed bottom-6 right-6 z-50"
          role="region"
          aria-label="Background music player"
        >
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{   scale: 0.9 }}
            title={playing ? "Pause music" : "Play ambient music"}
            className="relative flex items-center justify-center w-12 h-12 rounded-full"
            style={{
              background: "rgba(15,13,10,0.85)",
              border: "1px solid rgba(201,168,76,0.4)",
              backdropFilter: "blur(12px)",
              boxShadow: playing
                ? "0 0 0 0 rgba(201,168,76,0.4)"
                : "0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            {/* Pulsing ring animation while playing */}
            {playing && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ border: "1px solid rgba(201,168,76,0.5)" }}
                animate={{ scale: [1, 1.55], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}

            {playing ? (
              <Volume2 size={18} color="#c9a84c" />
            ) : (
              <VolumeX size={18} color="rgba(201,168,76,0.6)" />
            )}
          </motion.button>

          {/* Label tooltip */}
          <AnimatePresence>
            {!playing && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{    opacity: 0, x: 8 }}
                transition={{ delay: 0.3 }}
                className="absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap"
              >
                <div
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{
                    background: "rgba(15,13,10,0.85)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Music size={10} color="#c9a84c" />
                  <span
                    className="label-luxury"
                    style={{ color: "rgba(201,168,76,0.8)", fontSize: "0.6rem" }}
                  >
                    Play Music
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
