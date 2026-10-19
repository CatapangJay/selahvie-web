"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import type { FindResult } from "@/lib/invitations";

type Step = "lookup" | "code";

interface Props {
  /** Resolves a name or code to an invite code (on the server for live sites). */
  find: (input: string, step: Step) => Promise<FindResult>;
  /** Called with the invite code once the guest is identified. */
  onFound: (code: string) => void;
  /** The page was opened with an invite code that doesn't match anyone. */
  invalidCode?: boolean;
}

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

/**
 * Fallback for guests without their personal link: find the invitation by
 * name (fuzzy) or invite code. Ambiguous or duplicate names always fall back
 * to asking for the code, so one guest can't open another's invitation.
 */
export default function FindInvitation({ find, onFound, invalidCode = false }: Props) {
  const [open, setOpen] = useState(invalidCode);
  const [step, setStep] = useState<Step>("lookup");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(invalidCode ? "That invitation link didn't work. Try your name or the code on your invitation." : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const inputId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setStep("lookup");
    setValue("");
    setError("");
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, close]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = value.trim();
    if (!input || busy) return;

    setBusy(true);
    let result: FindResult;
    try {
      result = await find(input, step);
    } catch {
      setError("We couldn't look that up right now. Please try again.");
      return;
    } finally {
      setBusy(false);
    }

    if (result.status === "found") {
      onFound(result.code);
      close();
    } else if (step === "code") {
      setError("That code doesn't match an invitation. Check your invitation and try again.");
    } else if (result.status === "needs-code") {
      setStep("code");
      setValue("");
      setError("");
    } else {
      setError("We couldn't find that name. Try it as written on your invitation, or enter your invite code.");
    }
  };

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 1 }}
        className="fixed bottom-6 left-6 flex min-h-[44px] items-center gap-2 px-4 text-sm"
        style={{
          zIndex: "var(--z-sticky)",
          background: "rgba(24, 16, 20, 0.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color: "#fdf8f7",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 999,
        }}
        aria-haspopup="dialog"
      >
        <Mail size={15} aria-hidden />
        Find your invitation
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0"
              style={{ zIndex: "var(--z-modal-backdrop)", background: "rgba(20, 14, 16, 0.55)" }}
              onClick={close}
            />
            <div className="pointer-events-none fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: "var(--z-modal)" }}>
              <motion.div
                key="dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={spring}
                className="pointer-events-auto relative w-full max-w-md p-7 sm:p-9"
                style={{
                  background: "#fdfbf8",
                  color: "#2c1c22",
                  borderRadius: 16,
                  boxShadow: "0 24px 64px rgba(20,14,16,0.28)",
                }}
              >
                <button
                  type="button"
                  onClick={close}
                  className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <h2
                  id={titleId}
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.75rem", lineHeight: 1.15 }}
                >
                  {step === "lookup" ? "Find your invitation" : "Enter your invite code"}
                </h2>
                <p className="mt-2 text-sm font-light leading-relaxed" style={{ color: "rgba(44,28,34,0.72)" }}>
                  {step === "lookup"
                    ? "Enter your name as it appears on your invitation, or the code printed on it."
                    : "A few guests share a similar name, so we need the code from your invitation to find yours."}
                </p>

                <form onSubmit={handleSubmit} className="mt-6">
                  <label htmlFor={inputId} className="mb-2 block text-xs font-medium" style={{ color: "rgba(44,28,34,0.8)" }}>
                    {step === "lookup" ? "Name or invite code" : "Invite code"}
                  </label>
                  <input
                    ref={inputRef}
                    id={inputId}
                    value={value}
                    onChange={(e) => { setValue(e.target.value); setError(""); }}
                    placeholder={step === "lookup" ? "Maria Santos" : "ABCD-EFGH"}
                    autoComplete={step === "lookup" ? "name" : "off"}
                    autoCapitalize={step === "code" ? "characters" : "words"}
                    maxLength={80}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    className="w-full min-h-[48px] px-4 text-base outline-none"
                    style={{
                      background: "#fff",
                      border: `1px solid ${error ? "#b3261e" : "rgba(44,28,34,0.2)"}`,
                      borderRadius: 10,
                      color: "#2c1c22",
                      letterSpacing: step === "code" ? "0.12em" : undefined,
                    }}
                  />
                  {error && (
                    <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm" style={{ color: "#b3261e" }}>
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={!value.trim() || busy}
                    aria-busy={busy}
                    className="mt-5 w-full min-h-[48px] text-sm font-medium transition-opacity disabled:opacity-40"
                    style={{ background: "#2c1c22", color: "#fdfbf8", borderRadius: 10 }}
                  >
                    {busy ? "Looking…" : step === "lookup" ? "Find my invitation" : "Open my invitation"}
                  </button>
                  {step === "code" && (
                    <button
                      type="button"
                      onClick={() => { setStep("lookup"); setValue(""); setError(""); }}
                      className="mt-2 w-full min-h-[44px] text-sm underline underline-offset-2"
                      style={{ color: "rgba(44,28,34,0.72)" }}
                    >
                      Search by name instead
                    </button>
                  )}
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
