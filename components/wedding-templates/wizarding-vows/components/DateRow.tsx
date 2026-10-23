import type { CSSProperties } from "react";
import type { DateParts } from "../theme";
import { CAPS, capsLabel } from "../theme";

interface Props {
  date: DateParts;
  /** First time on the programme; the year is shown when there is none. */
  time?: string;
  /** Text colour for the weekday, month and time. */
  color: string;
  /** Colour of the large day number. */
  accent?: string;
  /** Colour of the hairline rules. */
  rule: string;
  style?: CSSProperties;
}

/** The date set between hairlines: weekday | month over a large day | time. Falls back to the written date. */
export default function DateRow({ date, time, color, accent = color, rule, style }: Props) {
  const line = `1px solid ${rule}`;
  if (!date.date) {
    return date.long ? <p style={{ ...capsLabel(color, 12), fontWeight: 700, margin: 0, ...style }}>{date.long}</p> : null;
  }
  const side: CSSProperties = { ...capsLabel(color, 11), fontWeight: 700, padding: "0.5rem 0", borderTop: line, borderBottom: line, alignSelf: "center" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "0.9rem", alignItems: "center", maxWidth: "22rem", margin: "0 auto", ...style }}>
      <span style={side}>{date.weekday}</span>
      <span style={{ padding: "0 0.95rem", borderLeft: line, borderRight: line, lineHeight: 1, textAlign: "center" }}>
        <span style={{ display: "block", ...capsLabel(color, 11), fontWeight: 700, paddingLeft: 0 }}>{date.date.toLocaleDateString("en-US", { month: "long" })}</span>
        <span style={{ display: "block", fontFamily: CAPS, fontWeight: 700, fontSize: "clamp(2rem, 9cqw, 2.6rem)", color: accent, marginTop: "0.2rem" }}>{date.date.getDate()}</span>
      </span>
      <span style={side}>{time || date.year}</span>
    </div>
  );
}
