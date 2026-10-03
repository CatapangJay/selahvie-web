import type { CSSProperties, ReactNode } from "react";
import type { Palette } from "../theme";
import { giltStyle } from "../theme";

interface Props {
  palette: Palette;
  shape?: "rect" | "oval" | "arch";
  /** CSS aspect-ratio of the picture opening, e.g. "4 / 5". */
  ratio?: string;
  className?: string;
  style?: CSSProperties;
  /** The picture. Absolutely fill the opening (e.g. next/image `fill`). */
  children: ReactNode;
}

const RADIUS = {
  rect: "3px",
  oval: "50%",
  arch: "999px 999px 3px 3px",
} as const;

/** Gilt picture frame with a bevel and a recessed, shadowed opening. */
export default function GiltFrame({ palette, shape = "rect", ratio = "4 / 5", className, style, children }: Props) {
  const radius = RADIUS[shape];
  return (
    <div
      className={className}
      style={{
        ...giltStyle(palette),
        padding: "clamp(0.55rem, 1.8vw, 0.95rem)",
        borderRadius: radius,
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,.4), inset 0 0 0 4px rgba(90,60,10,.18), 0 22px 40px -16px rgba(0,0,0,.6), 0 4px 10px rgba(0,0,0,.25)",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          aspectRatio: ratio,
          borderRadius: radius,
          background: palette.creamDeep,
        }}
      >
        {children}
        <span
          aria-hidden
          style={{ position: "absolute", inset: 0, borderRadius: "inherit", boxShadow: "inset 0 0 22px rgba(30,10,0,.5)", pointerEvents: "none" }}
        />
      </div>
    </div>
  );
}
