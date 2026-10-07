"use client";

import { useState } from "react";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import { MailCheck } from "lucide-react";
import { useAuthStore, DEMO_ACCOUNT, type AuthResult } from "@/store/authStore";

export type AuthMode = "login" | "signup";

const MIN_PASSWORD = 8;

interface AuthPanelProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  /** Where an email-confirmation link should land once the address is verified. */
  nextPath?: string;
  initialEmail?: string;
  initialPassword?: string;
  /** Called after a session exists (not after a sign-up that still needs email confirmation). */
  onSuccess?: (email: string) => void;
}

/** Shared log in / create account form (login page and checkout gate). */
export default function AuthPanel({
  mode,
  onModeChange,
  nextPath = "/dashboard",
  initialEmail = "",
  initialPassword = "",
  onSuccess,
}: AuthPanelProps) {
  const signIn = useAuthStore((s) => s.signIn);
  const signInAsDemo = useAuthStore((s) => s.signInAsDemo);
  const signUp = useAuthStore((s) => s.signUp);

  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const switchMode = () => {
    setError("");
    onModeChange(isSignup ? "login" : "signup");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim().toLowerCase();
    if (isSignup && !name.trim()) { setError("Tell us your name"); return; }
    if (!address.includes("@")) { setError("Enter a valid email"); return; }
    if (!password) { setError("Enter your password"); return; }
    if (isSignup && password.length < MIN_PASSWORD) { setError(`Use at least ${MIN_PASSWORD} characters`); return; }

    setPending(true);
    setError("");
    let result: AuthResult;
    if (isSignup) {
      result = await signUp(name, address, password, nextPath);
    } else if (address === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      result = await signInAsDemo(); // creates the demo user on first use
    } else {
      result = await signIn(address, password);
    }
    setPending(false);

    if (result.error) { setError(result.error); return; }
    if (result.needsConfirmation) { setSentTo(address); return; }
    onSuccess?.(address);
  };

  if (sentTo) {
    return (
      <div
        className="flex items-start gap-4 p-5"
        style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
        role="status"
      >
        <MailCheck size={20} className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Check your inbox</p>
          <p className="mt-1 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
            We sent a confirmation link to {sentTo}. Open it to activate your account — you&apos;ll come right back here.
          </p>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="mt-3 text-sm underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-primary)" }}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {isSignup && (
        <InputField
          label="Full name"
          id="auth-name"
          autoComplete="name"
          placeholder="Alexandra Chen"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
        />
      )}
      <InputField
        label="Email address"
        id="auth-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="hello@example.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(""); }}
      />
      <InputField
        label="Password"
        id="auth-password"
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        placeholder={isSignup ? `At least ${MIN_PASSWORD} characters` : "Your password"}
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError(""); }}
      />
      {error && (
        <p className="text-sm" style={{ color: "var(--color-error)" }} role="alert">{error}</p>
      )}
      <ButtonPrimary type="submit" size="lg" fullWidth disabled={pending}>
        {pending ? (isSignup ? "Creating account…" : "Logging in…") : isSignup ? "Create account" : "Log in"}
      </ButtonPrimary>
      <p className="text-center text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
        {isSignup ? "Already have an account?" : "New to Selah Vie?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          className="transition-opacity hover:opacity-70"
          style={{ color: "var(--color-primary)", fontWeight: 500 }}
        >
          {isSignup ? "Log in" : "Create an account"}
        </button>
      </p>
    </form>
  );
}
