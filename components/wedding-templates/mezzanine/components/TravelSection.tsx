import type { WeddingConfig } from "@/types/wedding";
import type { Palette } from "../theme";
import { BODY, SANS } from "../theme";
import { Floor, FloorHeading } from "./Motion";

/** Getting there and staying over: two short notes and a list of good-to-knows. */
export default function TravelSection({ travel, floor, palette: p }: { travel: WeddingConfig["travel"]; floor: number; palette: Palette }) {
  const directions = travel?.directions?.trim();
  const stay = travel?.accommodations?.trim();
  const notes = (travel?.notes ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  if (!directions && !stay && notes.length === 0) return null;

  const block = (title: string, body: string) => (
    <div style={{ padding: "1.3rem 0", borderTop: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)` }}>
      <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: p.inkSoft, margin: 0 }}>{title}</h3>
      <p style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.65, color: p.ink, margin: "0.45rem 0 0", maxWidth: "60ch" }}>{body}</p>
    </div>
  );

  return (
    <Floor id="travel" labelledBy="mz-travel-title" background={p.linen}>
      <FloorHeading id="mz-travel-title" floor={floor} title="Getting here" palette={p} />
      {directions && block("Finding us", directions)}
      {stay && block("Staying over", stay)}
      {notes.length > 0 && (
        <div style={{ padding: "1.3rem 0 0", borderTop: `1px solid color-mix(in srgb, ${p.bronze} 45%, transparent)` }}>
          <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: p.inkSoft, margin: 0 }}>Good to know</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.6rem 0 0" }}>
            {notes.map((n, i) => (
              <li key={i} style={{ display: "flex", gap: "0.8rem", fontFamily: SANS, fontSize: BODY, lineHeight: 1.6, color: p.ink, padding: "0.35rem 0" }}>
                <span aria-hidden style={{ flexShrink: 0, width: 7, height: 7, marginTop: "0.6em", border: `1px solid ${p.bronze}`, transform: "rotate(45deg)" }} />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Floor>
  );
}
