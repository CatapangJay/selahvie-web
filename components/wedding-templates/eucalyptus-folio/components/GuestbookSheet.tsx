"use client";

import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import GuestbookSection from "@/components/wedding-templates/_shared/sections/GuestbookSection";
import type { Palette } from "../theme";
import { DISPLAY, MONO, SANS, paperStyle } from "../theme";

/**
 * The shared guestbook (storage, demo behaviour and list) dressed as a folio
 * sheet: its surface and type tokens are pointed at the paper, sheet and ink
 * of this template. It keeps its own `#guestbook` anchor.
 */
export default function GuestbookSheet({ config, palette: p }: { config: WeddingConfig; palette: Palette }) {
  const tokens = {
    "--color-surface-container-low": p.paper,
    "--color-surface-container-lowest": p.sheet,
    "--color-surface-container": `color-mix(in srgb, ${p.paper} 70%, #FFFFFF)`,
    "--color-on-surface": p.text,
    "--color-primary": p.ink,
    "--font-serif": DISPLAY,
    "--radius-sm": "2px",
  } as CSSProperties;
  // The shared section brings rounded cards and the site's label face; square them off into folio sheets.
  const css = `
.ef-guestbook .rounded-2xl { border-radius: 2px; }
.ef-guestbook > section { padding-block: 2.75rem; }
.ef-guestbook .mb-10 { margin-bottom: 1.6rem; }
.ef-guestbook .label-luxury { font-family: ${MONO}; letter-spacing: .18em; font-weight: 400; }
.ef-guestbook .headline-md { font-family: ${DISPLAY}; font-weight: 300; }
.ef-guestbook textarea, .ef-guestbook input { font-family: ${SANS}; font-size: 1rem; }
`;
  return (
    <div className="ef-guestbook" style={{ ...paperStyle(p), ...tokens }}>
      <style>{css}</style>
      <GuestbookSection config={config} primary={p.ink} accent={p.rust} />
    </div>
  );
}
