"use client";

import { useEffect, useState } from "react";

/**
 * Returns false during SSR and the first client render, true after mount.
 *
 * Use to gate UI that depends on persisted (localStorage) store state — cart
 * count badge, favorite hearts, etc. The server and first client render must
 * match the empty/default store; only after hydration do we reflect the real
 * persisted values, avoiding React hydration mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
