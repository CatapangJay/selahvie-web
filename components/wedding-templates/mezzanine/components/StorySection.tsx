import type { Palette } from "../theme";
import { BODY, SANS } from "../theme";
import { Floor, FloorHeading } from "./Motion";

/** The couple's story: the opening paragraph set larger in oxblood, the rest at a reading measure. */
export default function StorySection({ story, floor, palette: p }: { story: string; floor: number; palette: Palette }) {
  const paragraphs = story.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;
  const [first, ...rest] = paragraphs;
  return (
    <Floor id="story" labelledBy="mz-story-title" background={p.linen}>
      <FloorHeading id="mz-story-title" floor={floor} title="How we got here" palette={p} />
      <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: "clamp(18px, 5cqw, 21px)", lineHeight: 1.6, color: p.oxblood, margin: 0, maxWidth: "58ch", textWrap: "pretty" }}>{first}</p>
      {rest.map((para, i) => (
        <p key={i} style={{ fontFamily: SANS, fontSize: BODY, lineHeight: 1.7, color: p.ink, margin: "1.2rem 0 0", maxWidth: "62ch", textWrap: "pretty" }}>
          {para}
        </p>
      ))}
    </Floor>
  );
}
