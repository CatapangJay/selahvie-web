import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";
import type { DateParts, Palette } from "../theme";
import { SCRIPT, SERIF, feltStyle } from "../theme";
import CalaLily from "./CalaLily";

interface Props {
  config: WeddingConfig;
  palette: Palette;
  date: DateParts;
  showBranding: boolean;
}

export default function TemplateFooter({ config, palette: p, date, showBranding }: Props) {
  return (
    <footer style={{ ...feltStyle(p.teal, p.tealDeep), padding: "clamp(3.5rem, 8vw, 5.5rem) 1.5rem 2.5rem", textAlign: "center" }}>
      <CalaLily className="mx-auto" style={{ width: "2.25rem", opacity: 0.95 }} />
      <p style={{ fontFamily: SCRIPT, fontSize: "clamp(2.4rem, 7vw, 3.6rem)", lineHeight: 1.15, color: p.cream, marginTop: "0.75rem" }}>
        {config.partner1Name} &amp; {config.partner2Name}
      </p>
      <p
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: "0.9rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: p.goldLight,
          marginTop: "0.5rem",
        }}
      >
        {date.dotted}
      </p>
      {showBranding && (
        <p style={{ fontFamily: SERIF, fontSize: "1rem", color: "rgba(251,246,236,.8)", marginTop: "2.5rem" }}>
          Created with{" "}
          <Link href="/" className="underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3dc9a]" style={{ color: p.goldLight }}>
            Selah Vie
          </Link>{" "}
          · Jewel Tones
        </p>
      )}
    </footer>
  );
}
