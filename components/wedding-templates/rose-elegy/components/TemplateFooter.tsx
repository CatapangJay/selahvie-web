import Link from "next/link";
import { Heart } from "lucide-react";
import type { WeddingConfig } from "@/types/wedding";

interface Props {
  config: WeddingConfig;
  primary: string;
  accent: string;
  weddingDateFormatted: string;
  show: boolean;
}

export default function TemplateFooter({ config, primary, accent, weddingDateFormatted, show }: Props) {
  if (!show) return null;

  return (
    <footer
      className="py-8 text-center"
      style={{
        background: "var(--color-surface-container-low)",
        borderTop: `1px solid ${accent}20`,
      }}
    >
      <div className="mx-auto max-w-4xl px-6">
        <Heart
          size={14}
          fill={accent}
          stroke="none"
          className="mx-auto mb-3"
          style={{ color: accent }}
        />
        <p
          className="label-luxury"
          style={{ color: "var(--color-on-surface-variant)", fontSize: "0.65rem" }}
        >
          {config.partner1Name} &amp; {config.partner2Name} · {weddingDateFormatted}
        </p>
        <p
          className="label-luxury mt-1"
          style={{ color: "var(--color-outline)", fontSize: "0.6rem" }}
        >
          Created with{" "}
          <Link
            href="/"
            className="underline-offset-2 hover:underline"
            style={{ color: primary }}
          >
            Selah Vie
          </Link>{" "}
          · Rosé Elegy Template
        </p>
      </div>
    </footer>
  );
}
