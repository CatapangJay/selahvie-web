"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Client view of the Supabase Auth session. Supabase owns the session (stored in
 * cookies and refreshed by the proxy); `AuthProvider` mirrors it into this store
 * so components can read it synchronously.
 */
export interface Account {
  id: string;
  name: string;
  email: string; // lowercased
  createdAt: string;
}

/** Demo credentials shown on the login page. The user lives in Supabase Auth. */
export const DEMO_ACCOUNT = {
  name: "Alex & Sam",
  email: "demo@selahvie.com",
  password: "demo1234",
} as const;

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthResult {
  error?: string;
  /** Sign-up succeeded but the email must be confirmed before a session exists. */
  needsConfirmation?: boolean;
}

interface AuthState {
  status: AuthStatus;
  account: Account | null;
  /** Lowercased email of the signed-in user, or null. */
  sessionEmail: string | null;

  /** Mirror a Supabase user into the store (called by AuthProvider). */
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string, redirectPath?: string) => Promise<AuthResult>;
  /** Sign into the demo account, creating it on first use. */
  signInAsDemo: () => Promise<AuthResult>;
  logout: () => Promise<void>;
}

function toAccount(user: User): Account {
  const meta = user.user_metadata as { name?: unknown } | undefined;
  return {
    id: user.id,
    name: typeof meta?.name === "string" ? meta.name.trim() : "",
    email: (user.email ?? "").toLowerCase(),
    createdAt: user.created_at,
  };
}

/** Map Supabase auth errors to copy that fits the product voice. */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match an account.";
  if (m.includes("email not confirmed")) return "Confirm your email first — check your inbox for the link.";
  if (m.includes("already registered")) return "An account already exists for this email. Log in instead.";
  if (m.includes("password")) return message;
  if (m.includes("rate limit")) return "Too many attempts. Wait a moment and try again.";
  return "Something went wrong. Please try again.";
}

const normalize = (email: string) => email.trim().toLowerCase();

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: "loading",
  account: null,
  sessionEmail: null,

  setUser: (user) => {
    const account = user ? toAccount(user) : null;
    set({
      account,
      sessionEmail: account?.email ?? null,
      status: account ? "authenticated" : "anonymous",
    });
  },

  signIn: async (email, password) => {
    const { data, error } = await createClient().auth.signInWithPassword({ email: normalize(email), password });
    if (error) return { error: friendlyError(error.message) };
    get().setUser(data.user);
    return {};
  },

  signUp: async (name, email, password, redirectPath = "/dashboard") => {
    const { data, error } = await createClient().auth.signUp({
      email: normalize(email),
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
    });
    if (error) return { error: friendlyError(error.message) };
    // With confirmations on, an existing email returns a user with no identities.
    if (data.user && data.user.identities?.length === 0) {
      return { error: "An account already exists for this email. Log in instead." };
    }
    if (!data.session) return { needsConfirmation: true };
    get().setUser(data.user);
    return {};
  },

  signInAsDemo: async () => {
    const { email, password, name } = DEMO_ACCOUNT;
    const signedIn = await get().signIn(email, password);
    if (!signedIn.error) return {};
    const created = await get().signUp(name, email, password);
    if (created.needsConfirmation) {
      return { error: "The demo account needs its email confirmed in Supabase (Authentication → Users) first." };
    }
    return created.error ? signedIn : {};
  },

  logout: async () => {
    await createClient().auth.signOut();
    get().setUser(null);
  },
}));
