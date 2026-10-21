import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, SANS } from "../theme";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

// Fixed star positions (percent of the footer) so server and client render the same sky.
const STARS = [
  [8, 22, 2], [18, 60, 1.5], [27, 14, 1.5], [38, 44, 2.5], [52, 18, 1.5], [61, 64, 2], [72, 30, 1.5], [83, 12, 2.5], [91, 52, 1.5], [46, 78, 1.5],
] as const;

/** Night after the sunset: a scatter of stars over the couple's names. */
export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  return (
    <footer style={{ position: "relative", overflow: "hidden", background: p.ink, padding: "4.5rem 1.25rem 2.5rem", textAlign: "center", color: p.morning }}>
      {STARS.map(([x, y, r], i) => (
        <span key={i} aria-hidden className="motion-safe:animate-pulse" style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, borderRadius: "50%", background: p.butter, opacity: 0.7, animationDelay: `${i * 0.37}s` }} />
      ))}
      <p style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 300, fontSize: "clamp(2rem, 8vw, 2.8rem)", lineHeight: 1.15, margin: 0 }}>
        {config.partner1Name} <em style={{ color: p.golden }}>&amp;</em> {config.partner2Name}
      </p>
      {date.long && (
        <p style={{ position: "relative", fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,246,236,.7)", marginTop: "0.75rem" }}>
          {date.monthDay}
          {date.year && ` · ${date.year}`}
        </p>
      )}
      <p style={{ position: "relative", fontFamily: DISPLAY, fontStyle: "italic", fontSize: "1.2rem", color: p.golden, marginTop: "1.5rem" }}>See you at golden hour.</p>
      {showBranding && (
        <p style={{ position: "relative", fontFamily: SANS, fontSize: 14, color: "rgba(255,246,236,.72)", marginTop: "2.25rem" }}>
          Created with{" "}
          <Link href="/" className="font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ color: p.butter, outlineColor: p.butter }}>
            Selah Vie
          </Link>{" "}
          · Apricot Hour
        </p>
      )}
    </footer>
  );
}
