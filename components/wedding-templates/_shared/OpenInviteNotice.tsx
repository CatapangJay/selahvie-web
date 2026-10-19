"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { OpenInviteMatching } from "./useOpenInviteMatch";

interface Props {
  matching: OpenInviteMatching;
  /** Label colour (code field label, secondary action). */
  labelColor: string;
  /** Message and typed text colour. */
  textColor: string;
  /** Underline colour of the code field. */
  lineColor: string;
  /** Primary action colour. */
  accent: string;
  /** Wrong-code message colour; pass a lighter red on dark templates. */
  errorColor?: string;
  /** Space above the notice when it shows. The empty notice takes no space. */
  offset?: string;
  /** Optional overrides for templates with their own type scale. */
  bodyStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  fieldStyle?: CSSProperties;
  actionStyle?: CSSProperties;
}

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

function seatsMessage(allowance: number): string {
  if (allowance <= 0) return "We found your invitation. Your seat is reserved.";
  if (allowance === 1) return "We found your invitation. You're welcome to bring a guest.";
  return `We found your invitation. You're welcome to bring up to ${allowance} guests.`;
}

/**
 * Sits under the RSVP name field on the open invitation. Confirms a recognised
 * guest's seats, or asks for the invite code when the name is shared. Says
 * nothing for names that aren't on the list, so it never reveals who is.
 */
export default function OpenInviteNotice({
  matching,
  labelColor,
  textColor,
  lineColor,
  accent,
  errorColor = "#b3261e",
  offset = "1rem",
  bodyStyle,
  labelStyle,
  fieldStyle,
  actionStyle,
}: Props) {
  const { active, state, checkCode, skipCode, attention, sendError } = matching;
  const [code, setCode] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // A held submit: bring the notice into view so the guest sees what changed.
  useEffect(() => {
    if (attention === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rootRef.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    codeRef.current?.focus({ preventScroll: true });
  }, [attention]);

  if (!active && !sendError) return null;

  const needsCode = state.step === "needs-code";
  const checking = needsCode && state.checking;
  const codeError = needsCode && state.codeError;
  const submitCode = () => {
    if (code.trim() && !checking) checkCode(code);
  };

  return (
    <div ref={rootRef} aria-live="polite">
      {sendError && (
        <p role="alert" className="text-sm leading-relaxed" style={{ paddingTop: offset, ...bodyStyle, color: errorColor }}>
          {sendError}
        </p>
      )}
      <AnimatePresence initial={false} mode="wait">
        {state.step === "matched" && (
          <motion.p
            key="matched"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="text-sm leading-relaxed"
            style={{ paddingTop: offset, color: textColor, ...bodyStyle }}
          >
            {seatsMessage(state.allowance)}
          </motion.p>
        )}

        {needsCode && (
          <motion.div
            key="needs-code"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="flex flex-col gap-3"
            style={{ paddingTop: offset }}
          >
            <p className="text-sm leading-relaxed" style={{ color: textColor, ...bodyStyle }}>
              A few guests share a similar name. Enter the code from your invitation so we can find yours.
            </p>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${id}-code`} className="label-luxury" style={{ color: labelColor, ...labelStyle }}>
                Invite code
              </label>
              <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                <input
                  ref={codeRef}
                  id={`${id}-code`}
                  value={code}
                  maxLength={12}
                  placeholder="ABCD-EFGH"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  aria-invalid={codeError}
                  aria-describedby={codeError ? `${id}-error` : undefined}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter here checks the code instead of sending the RSVP.
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitCode();
                    }
                  }}
                  className="min-h-[44px] w-40 min-w-0 border-0 border-b bg-transparent px-0 py-2 text-sm tracking-[0.12em] outline-none"
                  style={{ borderBottomColor: codeError ? errorColor : lineColor, color: textColor, ...fieldStyle }}
                />
                <button
                  type="button"
                  onClick={submitCode}
                  disabled={!code.trim() || checking}
                  className="min-h-[44px] text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
                  style={{ color: accent, ...actionStyle }}
                >
                  {checking ? "Checking…" : "Find my invitation"}
                </button>
                <button
                  type="button"
                  onClick={skipCode}
                  className="min-h-[44px] text-sm transition-opacity hover:opacity-70"
                  style={{ color: labelColor, ...actionStyle }}
                >
                  Continue without a code
                </button>
              </div>
              {codeError && (
                <p id={`${id}-error`} role="alert" className="text-sm" style={{ color: errorColor }}>
                  That code doesn&apos;t match an invitation. Check your invitation and try again.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
