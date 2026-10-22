import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { DISPLAY, MONO, SCRIPT, darkroomStyle, sprocketStyle, stampText } from "../theme";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

/** The end of the roll: the names once more, the date imprint, and a last length of sprockets. */
export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  return (
    <footer style={{ ...darkroomStyle(p), containerType: "inline-size", textAlign: "center" }}>
      <div aria-hidden style={sprocketStyle(p)} />
      <div style={{ padding: "4.5rem 1.25rem 2.75rem" }}>
        <p style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: p.stamp, margin: 0 }}>That&rsquo;s a wrap — see you there</p>
        <p style={{ fontFamily: DISPLAY, fontSize: "clamp(2.6rem, 12cqw, 4.5rem)", lineHeight: 1.05, color: p.print, margin: "1rem 0 0" }}>
          {config.partner1Name} <span style={{ fontFamily: SCRIPT, color: p.film }}>&amp;</span> <em>{config.partner2Name}</em>
        </p>
        {date.imprint && <p style={{ ...stampText(p), fontSize: 18, margin: "1rem 0 0" }}>{date.imprint}</p>}
        {showBranding && (
          <p style={{ fontFamily: MONO, fontSize: 14, color: "rgba(241,234,223,.75)", margin: "2.5rem 0 0" }}>
            Created with{" "}
            <Link href="/" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ color: p.paper, outlineColor: p.stamp }}>
              Selah Vie
            </Link>{" "}
            · Shutter &amp; Strip
          </p>
        )}
      </div>
    </footer>
  );
}
