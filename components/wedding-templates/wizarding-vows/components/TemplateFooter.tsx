import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { BOOK, DISPLAY, QUILL, capsLabel, giltText, slateStyle } from "../theme";
import DriedSpray from "./DriedFlowers";
import { Hallows } from "./Emblems";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

/** The map wiped clean: the Hallows drawn once more, "Mischief managed", the names in quill between dried flowers. */
export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  return (
    <footer style={{ ...slateStyle(p), containerType: "inline-size", position: "relative", overflow: "hidden", textAlign: "center", padding: "5rem 1.25rem 7rem" }}>
      <DriedSpray tone="light" style={{ position: "absolute", left: 0, bottom: 0, width: "min(40cqw, 15rem)" }} />
      <DriedSpray tone="light" flip style={{ position: "absolute", right: 0, bottom: 0, width: "min(36cqw, 13.5rem)" }} />
      <Hallows color={p.gilt} size={78} strokeWidth={2.5} draw style={{ display: "block", margin: "0 auto" }} />
      <p style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 400, fontSize: "clamp(1.9rem, 9cqw, 3rem)", lineHeight: 1.1, letterSpacing: "0.06em", margin: "1.6rem 0 0", ...giltText(p) }}>Mischief Managed</p>
      <p style={{ fontFamily: QUILL, fontSize: "clamp(2rem, 9cqw, 3rem)", lineHeight: 1.2, color: p.chalk, margin: "0.6rem 0 0" }}>
        {config.partner1Name} &amp; {config.partner2Name}
      </p>
      {date.roman && <p style={{ ...capsLabel(p.giltSoft, 12), margin: "0.8rem 0 0" }}>{date.roman}</p>}
      {showBranding && (
        <p style={{ fontFamily: BOOK, fontSize: 15, color: `color-mix(in srgb, ${p.chalk} 72%, transparent)`, margin: "2.6rem 0 0" }}>
          Created with{" "}
          <Link href="/" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ color: p.chalk, outlineColor: p.gilt }}>
            Selah Vie
          </Link>{" "}
          · Wizarding Vows
        </p>
      )}
    </footer>
  );
}
