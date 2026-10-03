"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { useAuthStore, DEMO_ACCOUNT } from "@/store/authStore";
import { useWeddingStore } from "@/store/weddingStore";
import { useHydrated } from "@/lib/useHydrated";
import { safeRedirectPath } from "@/lib/supabase/config";
import { Sparkles } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeRedirectPath(params.get("redirect"));

  const signIn = useAuthStore((s) => s.signIn);
  const signInAsDemo = useAuthStore((s) => s.signInAsDemo);
  const seedDemoConfigs = useWeddingStore((s) => s.seedDemoConfigs);
  const hydrated = useHydrated();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    params.get("error") === "link" ? "That sign-in link is invalid or has expired. Log in below." : ""
  );
  const [pending, setPending] = useState(false);

  const handleDemo = async () => {
    setPending(true);
    setError("");
    const result = await signInAsDemo();
    setPending(false);
    if (result.error) { setError(result.error); return; }
    seedDemoConfigs(DEMO_ACCOUNT.email); // give the demo dashboard real content
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    if (!password) { setError("Enter your password"); return; }
    if (email.trim().toLowerCase() === DEMO_ACCOUNT.email) {
      await handleDemo();
      return;
    }
    setPending(true);
    const result = await signIn(email, password);
    setPending(false);
    if (result.error) { setError(result.error); return; }
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
        <ButtonPrimary type="submit" size="lg" fullWidth disabled={!hydrated || pending}>
          {pending ? "Logging in…" : "Log in"}
        </ButtonPrimary>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <span className="h-px flex-1" style={{ background: "var(--color-outline)" }} />
        <span className="label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>or</span>
        <span className="h-px flex-1" style={{ background: "var(--color-outline)" }} />
      </div>

      {/* One-click demo */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--color-surface-container)", border: "1px solid var(--color-outline)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>Try the demo account</p>
        <p className="mt-1 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
          Jump straight into a dashboard with a published site and a draft, no checkout needed.
        </p>

        <div className="mt-4 flex flex-col gap-1 rounded-lg px-4 py-3 font-mono text-xs" style={{ background: "var(--color-surface)", border: "1px solid var(--color-outline)", color: "var(--color-on-surface-variant)" }}>
          <span>email:&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "var(--color-on-surface)" }}>{DEMO_ACCOUNT.email}</span></span>
          <span>password: <span style={{ color: "var(--color-on-surface)" }}>{DEMO_ACCOUNT.password}</span></span>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <ButtonPrimary size="md" fullWidth onClick={handleDemo} disabled={!hydrated || pending}>
            <Sparkles size={14} />
            Log in as demo
          </ButtonPrimary>
          <ButtonSecondary
            size="md"
            fullWidth
            onClick={() => { setEmail(DEMO_ACCOUNT.email); setPassword(DEMO_ACCOUNT.password); setError(""); }}
          >
            Fill the form
          </ButtonSecondary>
        </div>
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
