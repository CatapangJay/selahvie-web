"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useWeddingStore } from "@/store/weddingStore";

/**
 * Keeps the auth store in sync with the Supabase session (sign-in, sign-out,
 * refresh, other tabs) and loads the signed-in user's websites.
 */
export default function AuthProvider() {
  const setUser = useAuthStore((s) => s.setUser);
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.account?.id);
  const email = useAuthStore((s) => s.account?.email);

  useEffect(() => {
    // Fires INITIAL_SESSION immediately, then on every auth change.
    const { data } = createClient().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (userId && email) void useWeddingStore.getState().load({ id: userId, email });
    else if (status === "anonymous") useWeddingStore.getState().reset();
  }, [status, userId, email]);

  return null;
}
