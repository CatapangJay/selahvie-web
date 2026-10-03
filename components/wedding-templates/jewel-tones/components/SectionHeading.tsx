import type { Palette } from "../theme";
import { SCRIPT, SERIF } from "../theme";

interface Props {
  eyebrow: string;
  title: string;
  palette: Palette;
  /** "dark" sits on felt (raspberry/teal); "light" sits on cream paper. */
  tone: "dark" | "light";
  id?: string;
}

/** Eyebrow, script title and a gilt diamond rule. */
export default function SectionHeading({ eyebrow, title, palette: p, tone, id }: Props) {
  const dark = tone === "dark";
  return (
    <header className="text-center" style={{ marginBottom: "clamp(2.5rem, 6vw, 4rem)" }}>
      <p
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: "0.85rem",
          letterSpacing: "0.34em",
          textTransform: "uppercase",
          color: dark ? p.goldLight : p.goldInk,
        }}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        style={{
          fontFamily: SCRIPT,
          fontWeight: 400,
          fontSize: "clamp(2.8rem, 8vw, 4.6rem)",
          lineHeight: 1.1,
          marginTop: "0.35rem",
          color: dark ? p.cream : p.raspberryDeep,
          textShadow: dark ? "0 2px 14px rgba(0,0,0,.3)" : undefined,
        }}
      >
        {title}
      </h2>
      <div aria-hidden className="mx-auto mt-4 flex items-center justify-center gap-3">
        <span style={{ height: 1, width: "clamp(2.5rem, 8vw, 4.5rem)", background: `linear-gradient(90deg, transparent, ${p.gold})` }} />
        <span style={{ width: 9, height: 9, transform: "rotate(45deg)", background: p.gold }} />
        <span style={{ height: 1, width: "clamp(2.5rem, 8vw, 4.5rem)", background: `linear-gradient(270deg, transparent, ${p.gold})` }} />
      </div>
    </header>
  );
}
