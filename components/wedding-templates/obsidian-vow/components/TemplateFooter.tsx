import Link from "next/link";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  accent: string;
  weddingDateFormatted: string;
  show: boolean;
}

export default function TemplateFooter({ config, accent, weddingDateFormatted, show }: Props) {
  return (
    <footer
      className="py-10 text-center relative overflow-hidden"
      style={{ background: "#080706", borderTop: `1px solid ${accent}15` }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 inset-x-0 h-24 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, ${accent}06, transparent)` }}
        aria-hidden
      />

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill={accent}
          className="mx-auto mb-4"
          style={{ opacity: 0.6 }}
        >
          <polygon points="10,0 20,10 10,20 0,10" />
        </svg>

        <p
          className="label-luxury"
          style={{ color: "rgba(245,240,232,0.3)", fontSize: "0.65rem", letterSpacing: "0.14em" }}
        >
          {config.partner1Name} &amp; {config.partner2Name}
          {weddingDateFormatted ? ` · ${weddingDateFormatted}` : ""}
        </p>

        {show && (
          <p
            className="label-luxury mt-2"
            style={{ color: "rgba(245,240,232,0.18)", fontSize: "0.6rem" }}
          >
            Created with{" "}
            <Link
              href="/"
              className="hover:underline underline-offset-2"
              style={{ color: accent, opacity: 0.6 }}
            >
              Selah Vie
            </Link>
            {" "}· Obsidian Vow Template
          </p>
        )}
      </div>
    </footer>
  );
}
