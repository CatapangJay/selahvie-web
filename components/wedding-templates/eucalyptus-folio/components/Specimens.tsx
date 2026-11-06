import type { CSSProperties } from "react";

/**
 * Pressed eucalyptus cut out of public-domain (CC0) herbarium scans.
 * Credits: see CREDITS.md in this template folder.
 */
const ASSETS = "/templates/eucalyptus-folio";
export const SPRIGS = [`${ASSETS}/eucalyptus-sprig-1.webp`, `${ASSETS}/eucalyptus-sprig-2.webp`, `${ASSETS}/eucalyptus-sprig-3.webp`] as const;

/** Cut scans end in straight crop lines; fade every edge so none can show. */
const FADE = "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%)";

interface Props {
  which: 0 | 1 | 2;
  /** CSS width, e.g. "42cqw". Height follows the scan. */
  width: string;
  rotate?: number;
  flip?: boolean;
  style?: CSSProperties;
  opacity?: number;
}

/** One pressed sprig, laid on the paper with a faint contact shadow. Decorative. */
export function Sprig({ which, width, rotate = 0, flip = false, style, opacity = 1 }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SPRIGS[which]}
      alt=""
      aria-hidden
      draggable={false}
      loading="lazy"
      decoding="async"
      style={{
        position: "absolute",
        width,
        height: "auto",
        pointerEvents: "none",
        userSelect: "none",
        opacity,
        transform: `rotate(${rotate}deg)${flip ? " scaleX(-1)" : ""}`,
        filter: "drop-shadow(0 3px 3px rgba(40,44,30,.22))",
        maskImage: FADE,
        WebkitMaskImage: FADE,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
        ...style,
      }}
    />
  );
}
