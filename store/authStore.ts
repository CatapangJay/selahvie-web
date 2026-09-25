"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Mock authentication (V1, localStorage). No real backend, no password hashing —
 * this models the account/session flow so the purchase → account → login →
 * dashboard journey is complete. Any password "works" at login as long as an
 * account exists for that email (see architecture.MD §10 for the V2 real-auth
 * upgrade path).
 */
export interface Account {
  name: string;
  email: string; // lowercased, unique key
  createdAt: string;
}

interface AuthState {
  accounts: Record<string, Account>; // keyed by lowercased email
  sessionEmail: string | null;

  /** Create an account (idempotent by email). Returns the stored Account. */
  createAccount: (name: string, email: string) => Account;
  hasAccount: (email: string) => boolean;
  /** Mock sign-in: succeeds if an account exists for the email. */
  login: (email: string) => boolean;
  logout: () => void;
  currentAccount: () => Account | null;
}

const key = (email: string) => email.trim().toLowerCase();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accounts: {},
      sessionEmail: null,

      createAccount: (name, email) => {
        const e = key(email);
        const existing = get().accounts[e];
        const account: Account =
          existing ?? { name: name.trim() || "there", email: e, createdAt: new Date().toISOString() };
        set((state) => ({ accounts: { ...state.accounts, [e]: account } }));
        return account;
      },

      hasAccount: (email) => Boolean(get().accounts[key(email)]),

      login: (email) => {
        const e = key(email);
        if (!get().accounts[e]) return false;
        set({ sessionEmail: e });
        return true;
      },

      logout: () => set({ sessionEmail: null }),

      currentAccount: () => {
        const { sessionEmail, accounts } = get();
        return sessionEmail ? accounts[sessionEmail] ?? null : null;
      },
    }),
    { name: "selahvie-auth", version: 1 }
  )
);
