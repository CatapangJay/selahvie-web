import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { BODY, DISPLAY, SANS, isWebLink } from "../theme";
import { Floor, FloorHeading } from "./Motion";

/** Gifts as ruled entries: the name of each, any bank or e-wallet details beneath, a link where there is one. */
export default function RegistrySection({ config, floor, palette: p }: { config: WeddingConfig; floor: number; palette: Palette }) {
  const links = (config.registryLinks ?? []).filter((l) => l.label.trim());
  if (links.length === 0) return null;

  return (
    <Floor id="registry" labelledBy="mz-registry-title" background={p.linen}>
      <FloorHeading id="mz-registry-title" floor={floor} title="Gifts" lede="Having you there is the whole point. If you'd still like to give something, this is what would help most." palette={p} />
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {links.map((link) => (
          <li key={link.id} style={{ padding: "1.3rem 0", borderTop: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)` }}>
            <p style={{ fontFamily: DISPLAY, fontSize: "clamp(1.3rem, 5.8cqw, 1.6rem)", lineHeight: 1.2, color: p.ink, margin: 0 }}>{link.label}</p>
            {link.note && <p style={{ whiteSpace: "pre-line", fontFamily: SANS, fontSize: BODY, lineHeight: 1.65, color: p.inkSoft, margin: "0.4rem 0 0", overflowWrap: "anywhere", fontVariantNumeric: "tabular-nums" }}>{link.note}</p>}
            {isWebLink(link.url) && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ minHeight: 44, fontFamily: SANS, fontWeight: 600, fontSize: 15, color: p.oxblood, textDecoration: "underline", textUnderlineOffset: 5, textDecorationColor: `color-mix(in srgb, ${p.bronze} 70%, transparent)`, outlineColor: p.oxblood }}
              >
                Open {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </Floor>
  );
}
