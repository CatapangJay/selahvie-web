"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import { useAuthStore } from "@/store/authStore";
import { useHydrated } from "@/lib/useHydrated";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const login = useAuthStore((s) => s.login);
  const hasAccount = useAuthStore((s) => s.hasAccount);
  const hydrated = useHydrated();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    if (!password) { setError("Enter your password"); return; }
    // Mock: any password works, but the account must exist (created at checkout).
    if (!hasAccount(email)) {
      setError("No account found for that email. Purchase a template to create one.");
      return;
    }
    login(email);
    router.push(redirect);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-6" style={{ paddingTop: "calc(var(--spacing-section) + 2rem)", paddingBottom: "var(--spacing-section-xl)" }}>
      <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>Welcome back</p>
      <h1 className="headline-md" style={{ fontWeight: 300 }}>Log in to Selah Vie</h1>
      <p className="mt-4 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
        Pick up where you left off — customize your websites and follow your RSVPs.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <InputField
          label="Email address"
          id="login-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="hello@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
        />
        <InputField
          label="Password"
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
        />
        {error && (
          <p className="text-sm" style={{ color: "var(--color-error)" }} role="alert">{error}</p>
        )}
        <ButtonPrimary type="submit" size="lg" fullWidth disabled={!hydrated}>
          Log in
        </ButtonPrimary>
      </form>

      <div
        className="mt-8 rounded-xl p-4 text-sm font-light leading-relaxed"
        style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline)", color: "var(--color-on-surface-variant)" }}
      >
        <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>Demo login.</span>{" "}
        Accounts are created at checkout. Any password works — we just check the email has an account.
      </div>

      <p className="mt-6 text-center text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
        No account yet?{" "}
        <Link href="/templates" className="transition-colors hover:opacity-70" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
          Browse templates
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
