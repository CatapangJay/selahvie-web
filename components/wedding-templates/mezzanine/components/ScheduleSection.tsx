import type { ScheduleEvent } from "@/types/wedding";
import type { Palette } from "../theme";
import { BODY, DISPLAY, SANS } from "../theme";
import { Floor, FloorHeading } from "./Motion";

/** The evening as a lift shaft: a single bronze line with a diamond stop for each moment, times on the left. */
export default function ScheduleSection({ items, floor, palette: p }: { items: ScheduleEvent[]; floor: number; palette: Palette }) {
  const list = items.filter((s) => s.title?.trim() || s.time?.trim());
  if (list.length === 0) return null;
  return (
    <Floor id="schedule" labelledBy="mz-schedule-title" background={p.linen}>
      <FloorHeading id="mz-schedule-title" floor={floor} title="The evening" palette={p} />
      <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
        {list.map((s, i) => (
          <li key={s.id ?? i} style={{ display: "grid", gridTemplateColumns: "minmax(4.6rem, 26%) 22px minmax(0, 1fr)", alignItems: "start", columnGap: "0.6rem" }}>
            <p style={{ fontFamily: DISPLAY, fontSize: "clamp(1.05rem, 4.8cqw, 1.3rem)", lineHeight: 1.3, color: p.bronzeText, margin: 0, textAlign: "right", paddingTop: 1, fontVariantNumeric: "lining-nums" }}>{s.time}</p>
            <span aria-hidden style={{ position: "relative", alignSelf: "stretch", display: "flex", justifyContent: "center" }}>
              <span style={{ position: "absolute", top: i === 0 ? 10 : 0, bottom: i === list.length - 1 ? "calc(100% - 10px)" : 0, width: 1, background: `color-mix(in srgb, ${p.bronze} 60%, transparent)` }} />
              <span style={{ position: "relative", marginTop: 6, width: 9, height: 9, background: p.linen, border: `1px solid ${p.bronze}`, transform: "rotate(45deg)" }} />
            </span>
            <div style={{ paddingBottom: i === list.length - 1 ? 0 : "1.6rem", minWidth: 0 }}>
              <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: BODY, lineHeight: 1.4, color: p.ink, margin: 0 }}>{s.title}</p>
              {s.description && <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: p.inkSoft, margin: "0.25rem 0 0" }}>{s.description}</p>}
            </div>
          </li>
        ))}
      </ol>
    </Floor>
  );
}
