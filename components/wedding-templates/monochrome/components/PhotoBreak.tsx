import { BODY, cssImage } from "../theme";

/** Full-bleed photograph with a film-edge caption. Renders nothing for a missing or unsafe URL. */
export default function PhotoBreak({ url, caption }: { url?: string; caption: string }) {
  const image = cssImage(url);
  if (!image) return null;
  return (
    <figure style={{ position: "relative", margin: 0 }}>
      <div
        role="img"
        aria-label="Photo of the couple"
        style={{ height: "clamp(320px, 56vh, 620px)", backgroundImage: image, backgroundSize: "cover", backgroundPosition: "center", filter: "grayscale(1) contrast(1.05)" }}
      />
      <figcaption
        style={{
          position: "absolute",
          left: "clamp(1rem, 4vw, 2rem)",
          bottom: "clamp(1rem, 4vw, 1.75rem)",
          fontFamily: BODY,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#fff",
          textShadow: "0 1px 8px rgba(0,0,0,.5)",
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
}
