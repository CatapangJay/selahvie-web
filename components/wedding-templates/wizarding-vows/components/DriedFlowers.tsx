import type { CSSProperties } from "react";

/**
 * Real pressed botanicals, cut out of public-domain (CC0) herbarium scans:
 * - bunny-tail grass, Lagurus ovatus: Smithsonian NMNH, US 3718259 (GBIF 1319133114)
 * - bunny-tail grass on long stems, Lagurus ovatus: Naturalis Biodiversity Center (GBIF 2516910013)
 * - quaking grass, Briza maxima: Naturalis Biodiversity Center, L.4579935 (GBIF 5207102348)
 */
const ASSETS = "/templates/wizarding-vows";
const STEMS = `${ASSETS}/dried-bunny-stems.webp`;
const CLUSTER = `${ASSETS}/dried-bunny-cluster.webp`;
const QUAKING = `${ASSETS}/dried-quaking-grass.webp`;

/** Each stem's place in the spray, as percentages of the inner bouquet box (stems gather at the lower left). */
const LAYOUT: { src: string; w: number; ratio: number; left: number; bottom: number; rotate: number }[] = [
  { src: QUAKING, w: 50, ratio: 650 / 740, left: 6, bottom: 18, rotate: -24 },
  { src: STEMS, w: 72, ratio: 875 / 1322, left: 4, bottom: 0, rotate: -4 },
  { src: CLUSTER, w: 48, ratio: 575 / 930, left: 34, bottom: 6, rotate: 14 },
];

/**
 * The scans were cropped from herbarium sheets, so every photo has straight cut edges and stems that end
 * abruptly. Each image fades out toward its edges (most at the cut stem ends), and the whole spray fades
 * toward the corner where the stems gather and along its own box, so no hard line can ever show, even
 * where a section clips it.
 */
const fadeEdges = (...layers: string[]): CSSProperties => {
  const mask = layers.join(", ");
  return { maskImage: mask, WebkitMaskImage: mask, maskComposite: "intersect", WebkitMaskComposite: "source-in" };
};
const IMAGE_FADE = fadeEdges(
  "linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)",
  "linear-gradient(to bottom, transparent 0%, #000 6%, #000 70%, transparent 100%)"
);
const SPRAY_FADE = fadeEdges(
  "linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%)",
  "linear-gradient(to bottom, transparent 0%, #000 5%, #000 95%, transparent 100%)",
  "linear-gradient(40deg, transparent 0%, #000 30%)"
);

const TONES = {
  /** On charcoal: a little brighter, with a deeper shadow. */
  light: "sepia(.38) saturate(.8) brightness(1.04) drop-shadow(0 10px 14px rgba(0,0,0,.4))",
  /** On linen: warmer and a shade darker so the pale heads still read, with a soft paper shadow. */
  dark: "sepia(.55) saturate(.85) brightness(.9) contrast(1.06) drop-shadow(0 6px 8px rgba(70,45,20,.25))",
} as const;

interface Props {
  tone?: keyof typeof TONES;
  /** Mirror left to right, for the opposite corner. */
  flip?: boolean;
  /** Load straight away (above the fold) instead of lazily. */
  eager?: boolean;
  style?: CSSProperties;
}

/**
 * A spray of dried grasses for a corner: long-stemmed and clustered bunny
 * tails with quaking grass behind, the stems dissolving where they gather.
 * Decorative only. Size it with `style.width`; the height follows. Keep it
 * inside its section (turn it, don't push it past the edge).
 */
export default function DriedSpray({ tone = "dark", flip = false, eager = false, style }: Props) {
  return (
    <div aria-hidden style={{ position: "relative", aspectRatio: "100 / 128", pointerEvents: "none", ...style }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", transform: flip ? "scaleX(-1)" : undefined, filter: TONES[tone], ...SPRAY_FADE }}>
        {/* Inset so the flower heads keep clear of the spray's own faded edges */}
        <div style={{ position: "absolute", inset: "6% 6% 0 2%" }}>
        {LAYOUT.map((l) => (
          // eslint-disable-next-line @next/next/no-img-element -- decorative cut-outs layered with CSS transforms; next/image adds nothing here.
          <img
            key={l.src}
            src={l.src}
            alt=""
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            style={{
              position: "absolute",
              left: `${l.left}%`,
              bottom: `${l.bottom}%`,
              width: `${l.w}%`,
              aspectRatio: String(l.ratio),
              transform: `rotate(${l.rotate}deg)`,
              transformOrigin: "20% 100%",
              ...IMAGE_FADE,
            }}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
