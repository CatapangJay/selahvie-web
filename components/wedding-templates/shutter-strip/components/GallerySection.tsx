import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { MONO, cssImage, darkroomStyle, stampText } from "../theme";
import { SectionHeading } from "./Motion";
import PhotoStrip from "./PhotoStrip";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  imprint: string;
}

const PER_STRIP = 3;
const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5];

/**
 * Prints hung on the darkroom line: the gallery is cut into booth strips of
 * three, clipped to a string, and each frame develops as it scrolls into view.
 */
export default function GallerySection({ config, palette: p, imprint }: Props) {
  const images = config.galleryImageUrls.map(cssImage).filter((u): u is string => Boolean(u));
  if (images.length === 0) return null;
  const strips: string[][] = [];
  // Balance the strips so the last one is never a lone frame (4 photos → 2 + 2, 7 → 3 + 2 + 2).
  const stripCount = Math.ceil(images.length / PER_STRIP);
  const base = Math.floor(images.length / stripCount);
  const extra = images.length % stripCount;
  for (let s = 0, i = 0; s < stripCount; s++) {
    const size = base + (s < extra ? 1 : 0);
    strips.push(images.slice(i, i + size));
    i += size;
  }

  return (
    <section aria-labelledby="ss-gallery-title" style={{ ...darkroomStyle(p), padding: "5.5rem 1rem 6rem" }}>
      <SectionHeading id="ss-gallery-title" caption="Fresh from the tray" title="Contact |Prints" color={p.print} accent={p.stamp} />
      <ul style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2.75rem clamp(1rem, 5vw, 2.5rem)", maxWidth: 900, listStyle: "none", padding: "1.5rem 0 0", margin: "0 auto" }}>
        {strips.map((frames, si) => (
          <li key={si} style={{ position: "relative", paddingTop: 18 }}>
            {/* Drying-line clip */}
            <span aria-hidden style={{ position: "absolute", top: 0, left: "50%", width: 16, height: 26, marginLeft: -8, borderRadius: 3, background: "#C9A27C", boxShadow: "inset 0 -3px 0 rgba(0,0,0,.25)", zIndex: 1 }} />
            <PhotoStrip
              palette={p}
              frames={frames}
              inView
              stagger={0.25}
              width="clamp(130px, 38vw, 200px)"
              labelPrefix={`Gallery strip ${si + 1}, photo`}
              style={{ transform: `rotate(${TILTS[si % TILTS.length]}deg)` }}
              caption={
                <span style={{ ...stampText(p), color: p.film, textShadow: "none", fontSize: 11 }}>
                  {imprint || <span style={{ fontFamily: MONO }}>No. {String(si + 1).padStart(2, "0")}</span>}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
