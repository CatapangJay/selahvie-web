import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { ACCENT, BODY, numeralDate } from "../theme";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  showBranding: boolean;
}

export default function TemplateFooter({ config, palette: p, showBranding }: Props) {
  const date = numeralDate(config.weddingDate);
  return (
    <footer style={{ background: p.ink, borderTop: "1px solid rgba(255,255,255,.2)", padding: "3.5rem 1rem 2.5rem", textAlign: "center" }}>
      <p style={{ fontFamily: ACCENT, fontSize: "clamp(40px, 11vw, 56px)", color: "#fff", lineHeight: 1, margin: 0 }}>
        {config.partner1Name} &amp; {config.partner2Name}
      </p>
      {date && (
        <p style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, letterSpacing: "0.3em", paddingLeft: "0.3em", color: "rgba(255,255,255,.65)", marginTop: "0.75rem" }}>{date}</p>
      )}
      {showBranding && (
        <p style={{ fontFamily: BODY, fontSize: 15, letterSpacing: "0.04em", color: "rgba(255,255,255,.72)", marginTop: "2rem" }}>
          Created with{" "}
          <Link href="/" className="font-semibold text-white underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Selah Vie
          </Link>{" "}
          · Monochrome
        </p>
      )}
    </footer>
  );
}
