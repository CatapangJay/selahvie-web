import type { CSSProperties } from "react";

export interface StatementPart {
  text: string;
  /** Set in the italic rose accent. */
  em?: boolean;
}

interface Props {
  parts: StatementPart[];
  className?: string;
  style?: CSSProperties;
  emStyle?: CSSProperties;
}

/**
 * A statement whose words fill with ink one after another as it crosses the
 * screen (the "word highlight" moment; CSS in globals.css under .statement).
 * Every word is a real text node in reading order, so screen readers and
 * search engines read the sentence normally; without scroll-timeline support or
 * under reduced motion the words simply stand in full ink.
 */
export default function Statement({ parts, className, style, emStyle }: Props) {
  let i = 0;
  return (
    <h2 className={`statement ${className ?? ""}`} style={style}>
      {parts.map((part, p) =>
        part.text
          .split(/(\s+)/)
          .filter(Boolean)
          .map((token, t) => {
            if (/^\s+$/.test(token)) return token;
            const index = i++;
            const vars = { "--i": index } as CSSProperties;
            return part.em ? (
              <em key={`${p}-${t}`} className="w" style={{ ...emStyle, ...vars }}>
                {token}
              </em>
            ) : (
              <span key={`${p}-${t}`} className="w" style={vars}>
                {token}
              </span>
            );
          })
      )}
    </h2>
  );
}
