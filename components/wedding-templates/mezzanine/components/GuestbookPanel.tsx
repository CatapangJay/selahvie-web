"use client";

import type { CSSProperties } from "react";
import type { WeddingConfig } from "@/types/wedding";
import GuestbookSection from "@/components/wedding-templates/_shared/sections/GuestbookSection";
import type { Palette } from "../theme";
import { DISPLAY, GUTTER, SANS } from "../theme";

/**
 * The shared guestbook (storage, demo behaviour and list) dressed for the
 * mezzanine: its surface and type tokens point at this template's linen,
 * ink and oxblood. It keeps its own `#guestbook` anchor.
 */
export default function GuestbookPanel({ config, palette: p }: { config: WeddingConfig; palette: Palette }) {
  const tokens = {
    "--color-surface-container-low": p.linen,
    "--color-surface-container-lowest": "#FFFFFF",
    "--color-surface-container": `color-mix(in srgb, ${p.linen} 80%, ${p.bronze})`,
    "--color-on-surface": p.ink,
    "--color-primary": p.oxblood,
    "--font-serif": DISPLAY,
    "--radius-sm": "2px",
  } as CSSProperties;
  // The shared section is centred, with an eyebrow, a boxed form and a square caps button.
  // Bring it into line with the floors: a left-aligned title, open underlined fields and the oxblood pill.
  const line = p.bronzeText;
  const css = `
.mz-guestbook > section { padding-block: 3.75rem; }
.mz-guestbook > section > div { padding-inline: ${GUTTER}; max-width: calc(600px + 2 * ${GUTTER}); }
.mz-guestbook .mb-10.text-center { text-align: left; margin-bottom: 1.6rem; }
.mz-guestbook .mb-10.text-center > .label-luxury { display: none; }
.mz-guestbook .headline-md { font-family: ${DISPLAY}; font-weight: 400; font-size: clamp(2rem, 9.5cqw, 3.2rem); line-height: 1.05; letter-spacing: -0.01em; }
.mz-guestbook form { background: transparent !important; border: 0 !important; padding: 0 !important; border-radius: 0 !important; gap: 1.4rem; }
.mz-guestbook form input, .mz-guestbook form textarea { font-family: ${SANS}; font-size: 1.0625rem; font-weight: 400; color: ${p.ink} !important; background: transparent !important; border: 0 !important; border-bottom: 1px solid ${line} !important; border-radius: 0 !important; padding: 0.6rem 0 !important; }
.mz-guestbook form input::placeholder, .mz-guestbook form textarea::placeholder { color: ${p.inkSoft}; opacity: 1; }
.mz-guestbook form input:focus-visible, .mz-guestbook form textarea:focus-visible { outline: 2px solid ${p.oxblood}; outline-offset: 3px; }
.mz-guestbook form button[type="submit"] { font-family: ${SANS}; font-weight: 600; font-size: 16px; letter-spacing: 0; text-transform: none; min-height: 52px; padding: 0 1.6rem; border-radius: 999px !important; background: ${p.oxblood}; color: ${p.linenOn} !important; }
.mz-guestbook form button[type="submit"] svg { display: none; }
.mz-guestbook li { border-radius: 2px; }
`;
  return (
    <div className="mz-guestbook" style={{ background: p.linen, ...tokens }}>
      <style>{css}</style>
      <GuestbookSection config={config} primary={p.oxblood} accent={p.bronze} />
    </div>
  );
}
