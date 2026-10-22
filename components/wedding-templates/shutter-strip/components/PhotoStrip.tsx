"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Palette } from "../theme";
import { Developing } from "./Motion";

interface Props {
  palette: Palette;
  frames: (string | undefined)[];
  /** Typed along the strip's bottom margin, like the booth's printed caption. */
  caption?: ReactNode;
  width?: CSSProperties["width"];
  /** Develop the frames now (intro) or when scrolled into view (gallery). */
  play?: boolean;
  inView?: boolean;
  /** Seconds between each frame starting to develop. */
  stagger?: number;
  delay?: number;
  tone?: string;
  style?: CSSProperties;
  labelPrefix?: string;
}

/** A booth print: square frames stacked on a white strip with a typed caption at the foot. */
export default function PhotoStrip({ palette: p, frames, caption, width = 150, play = true, inView = false, stagger = 0.45, delay = 0, tone, style, labelPrefix = "Photo" }: Props) {
  return (
    <div
      style={{
        width,
        background: p.print,
        padding: "8% 8% 0",
        boxShadow: "0 1px 0 rgba(0,0,0,.05), 0 18px 30px -18px rgba(10,12,20,.65)",
        ...style,
      }}
    >
      {/* Margins rather than gap: vertical percentages then resolve against the strip's width. */}
      <div>
        {frames.map((image, i) => (
          <Developing
            key={i}
            image={image}
            label={`${labelPrefix} ${i + 1}`}
            play={play}
            inView={inView}
            delay={delay + i * stagger}
            tone={tone}
            style={{ aspectRatio: "1 / 1", width: "100%", marginTop: i === 0 ? 0 : "7%" }}
          />
        ))}
      </div>
      <div style={{ minHeight: "2.6em", display: "grid", placeItems: "center", padding: "0.5em 0", textAlign: "center" }}>{caption}</div>
    </div>
  );
}
