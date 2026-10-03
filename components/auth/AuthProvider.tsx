"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

/** Keeps the auth store in sync with the Supabase session (sign-in, sign-out, refresh, other tabs). */
export default function AuthProvider() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // Fires INITIAL_SESSION immediately, then on every auth change.
    const { data } = createClient().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [setUser]);

  return null;
}
