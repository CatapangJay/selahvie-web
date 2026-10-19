"use client";

import { useCallback, useRef, useState } from "react";
import { normalizeName, type OpenInviteMatch } from "@/lib/invitations";
import { useGuestMatcher } from "./InviteeContext";

export type OpenInviteState =
  | { step: "idle" }
  | { step: "checking" }
  | { step: "matched"; guestId: string; allowance: number }
  | { step: "needs-code"; checking: boolean; codeError: boolean }
  | { step: "unmatched" };

export interface OpenInviteMatching {
  /** False on Base sites, personal invite links, or when the couple turned matching off. */
  active: boolean;
  state: OpenInviteState;
  /** Look the typed name up (call on blur). Unchanged names aren't looked up again. */
  checkName: (name: string) => void;
  checkCode: (code: string) => void;
  /** Continue without a code: the response follows the site-wide plus-one setting. */
  skipCode: () => void;
  /** Bumped when a submit is held so the guest can see what the lookup changed. */
  attention: number;
  /** Set when the response couldn't be sent; shown under the name field. */
  sendError: string;
}

const IDLE: OpenInviteState = { step: "idle" };
const CHECKING: OpenInviteState = { step: "checking" };
const UNMATCHED: OpenInviteState = { step: "unmatched" };
const CODE_ERROR: OpenInviteState = { step: "needs-code", checking: false, codeError: true };

/** A result newer than this probably landed as the guest pressed Send, unseen. */
const UNSEEN_MS = 900;

function toState(m: OpenInviteMatch): OpenInviteState {
  if (m.status === "match") return { step: "matched", guestId: m.guestId, allowance: m.allowance };
  if (m.status === "needs-code") return { step: "needs-code", checking: false, codeError: false };
  return UNMATCHED;
}

/**
 * Recognises a guest on the open invitation from the name they type in the RSVP
 * form, so a guest the couple gave extra seats gets them without their link.
 * Ambiguous names ask for the invite code; anyone not on the list carries on
 * with the site-wide plus-one setting. Used through `useRsvpSubmit`.
 */
export function useOpenInviteMatch(enabled: boolean) {
  const matcher = useGuestMatcher();
  const active = enabled && matcher !== null;
  const [state, setStateValue] = useState<OpenInviteState>(IDLE);
  const [attention, setAttention] = useState(0);
  const [sendError, setSendErrorValue] = useState("");
  const stateRef = useRef<OpenInviteState>(IDLE);
  const checkedName = useRef<string | null>(null);
  const pending = useRef<Promise<void> | null>(null);
  const seq = useRef(0);
  const resolvedAt = useRef(0);

  const setState = useCallback((next: OpenInviteState) => {
    stateRef.current = next;
    setStateValue(next);
  }, []);

  /** Runs a lookup; a newer lookup or a skip makes older results stale. */
  const run = useCallback(
    (lookup: () => Promise<OpenInviteState>, onError: OpenInviteState) => {
      const id = ++seq.current;
      const done = lookup()
        .catch(() => onError)
        .then((next) => {
          if (id !== seq.current) return;
          resolvedAt.current = Date.now();
          setState(next);
        });
      pending.current = done;
      return done;
    },
    [setState]
  );

  const lookUpName = useCallback(
    (name: string): Promise<void> => {
      if (!active || !matcher) return Promise.resolve();
      const key = normalizeName(name);
      if (key === checkedName.current) return pending.current ?? Promise.resolve();
      checkedName.current = key;
      if (key.length < 3) {
        seq.current++;
        pending.current = null;
        setState(IDLE);
        return Promise.resolve();
      }
      setState(CHECKING);
      return run(async () => toState(await matcher.byName(name)), UNMATCHED);
    },
    [active, matcher, run, setState]
  );

  const checkCode = useCallback(
    (code: string) => {
      if (!active || !matcher || !code.trim()) return;
      setState({ step: "needs-code", checking: true, codeError: false });
      void run(async () => {
        const m = await matcher.byCode(code);
        return m.status === "match" ? toState(m) : CODE_ERROR;
      }, CODE_ERROR);
    },
    [active, matcher, run, setState]
  );

  const skipCode = useCallback(() => {
    seq.current++;
    pending.current = null;
    setState(UNMATCHED);
  }, [setState]);

  /** Final state for this name, looking it up first if it hasn't been. */
  const settle = useCallback(
    async (name: string): Promise<OpenInviteState> => {
      await lookUpName(name);
      return stateRef.current;
    },
    [lookUpName]
  );

  /** True once per result that arrived too recently for the guest to have seen it. */
  const takeUnseen = useCallback(() => {
    const unseen = Date.now() - resolvedAt.current < UNSEEN_MS;
    if (unseen) {
      resolvedAt.current = 0;
      setAttention((n) => n + 1);
    }
    return unseen;
  }, []);

  const checkName = useCallback((name: string) => void lookUpName(name), [lookUpName]);

  /** Show (or clear, with "") a send failure and bring it into view. */
  const setSendError = useCallback((message: string) => {
    setSendErrorValue(message);
    if (message) setAttention((n) => n + 1);
  }, []);

  const matching: OpenInviteMatching = { active, state, checkName, checkCode, skipCode, attention, sendError };
  return { matching, settle, takeUnseen, setSendError };
}
