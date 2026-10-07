"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import AuthPanel, { type AuthMode } from "@/components/auth/AuthPanel";
import { useAuthStore, DEMO_ACCOUNT } from "@/store/authStore";
import { useWeddingStore } from "@/store/weddingStore";
import { safeRedirectPath } from "@/lib/supabase/config";
import { Sparkles } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeRedirectPath(params.get("redirect"));

  const status = useAuthStore((s) => s.status);
  const signInAsDemo = useAuthStore((s) => s.signInAsDemo);
  const seedDemoConfigs = useWeddingStore((s) => s.seedDemoConfigs);

  const [mode, setMode] = useState<AuthMode>(params.get("mode") === "signup" ? "signup" : "login");
  // "Fill the form" remounts the panel with the demo credentials.
  const [fill, setFill] = useState<{ n: number; email: string; password: string }>({ n: 0, email: "", password: "" });
  const [demoPending, setDemoPending] = useState(false);
  const [demoError, setDemoError] = useState("");

  // Already signed in (or just signed in): continue to where they were headed.
  useEffect(() => {
    if (status === "authenticated") router.replace(redirect);
  }, [status, redirect, router]);

  const handleSuccess = (email: string) => {
    if (email === DEMO_ACCOUNT.email) seedDemoConfigs(email);
  };

  const handleDemo = async () => {
    setDemoPending(true);
    setDemoError("");
    const result = await signInAsDemo();
    setDemoPending(false);
    if (result.error) { setDemoError(result.error); return; }
    seedDemoConfigs(DEMO_ACCOUNT.email); // give the demo dashboard real content
    router.replace("/dashboard");
  };

  const isSignup = mode === "signup";
  const linkError = params.get("error") === "link";
  const confirmed = params.get("notice") === "confirmed";

  return (
    <div className="mx-auto flex max-w-md flex-col px-6" style={{ paddingTop: "calc(var(--spacing-section) + 2rem)", paddingBottom: "var(--spacing-section-xl)" }}>
      <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>
        {isSignup ? "Get started" : "Welcome back"}
      </p>
      <h1 className="headline-md" style={{ fontWeight: 300 }}>
        {isSignup ? "Create your account" : "Log in to Selah Vie"}
      </h1>
      <p className="mt-4 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
        {isSignup
          ? "Keep your wedding websites in one place, customize them any time, and follow your RSVPs."
          : "Pick up where you left off — customize your websites and follow your RSVPs."}
      </p>

      {linkError && (
        <p className="mt-6 text-sm" style={{ color: "var(--color-error)" }} role="alert">
          That link is invalid or has already been used. If you already confirmed your email, log in below; otherwise sign up again to get a fresh link.
        </p>
      )}
      {confirmed && (
        <p className="mt-6 text-sm" style={{ color: "var(--color-primary)" }} role="status">
          Your email is confirmed. Log in to continue.
        </p>
      )}

      <div className="mt-10">
        <AuthPanel
          key={fill.n}
          mode={mode}
          onModeChange={setMode}
          nextPath={redirect}
          initialEmail={fill.email}
          initialPassword={fill.password}
          onSuccess={handleSuccess}
        />
      </div>

      {!isSignup && (
        <>
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

            {demoError && (
              <p className="mt-4 text-sm" style={{ color: "var(--color-error)" }} role="alert">{demoError}</p>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <ButtonPrimary size="md" fullWidth onClick={handleDemo} disabled={demoPending}>
                <Sparkles size={14} />
                {demoPending ? "Logging in…" : "Log in as demo"}
              </ButtonPrimary>
              <ButtonSecondary
                size="md"
                fullWidth
                onClick={() => setFill((f) => ({ n: f.n + 1, email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password }))}
              >
                Fill the form
              </ButtonSecondary>
            </div>
          </div>
        </>
      )}

      <p className="mt-6 text-center text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
        Just looking?{" "}
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
