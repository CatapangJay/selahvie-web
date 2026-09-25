"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Check, MailCheck } from "lucide-react";
import { InputField } from "@/components/ui/InputField";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import { useAuthStore } from "@/store/authStore";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const ids = params.get("ids")?.split(",").filter(Boolean) ?? [];
  const email = params.get("email") ?? "";
  const name = params.get("name") ?? "";
  const method = params.get("method") ?? "card";

  const createAccount = useAuthStore((s) => s.createAccount);
  const login = useAuthStore((s) => s.login);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const methodLabel = method === "gcash" ? "GCash" : method === "maya" ? "Maya" : "card";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: password isn't stored; we only require it to feel real + match.
    if (password.length < 6) { setError("Use at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    createAccount(name, email);
    login(email); // sign them straight in after creating the account
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-xl px-6" style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}>
      {/* Confirmation header */}
      <div
        className="mb-8 flex h-14 w-14 items-center justify-center"
        style={{ background: "var(--color-primary-container)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline-variant)" }}
      >
        <Check size={22} style={{ color: "var(--color-primary)" }} strokeWidth={1.75} />
      </div>

      <p className="label-luxury mb-3" style={{ color: "var(--color-primary)" }}>Payment confirmed</p>
      <h1 className="headline-md" style={{ fontWeight: 300 }}>
        You&apos;re all set{name ? `, ${name.split(" ")[0]}` : ""}.
      </h1>
      <p className="mt-5 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
        Your payment via {methodLabel} went through and {ids.length} wedding {ids.length === 1 ? "website is" : "websites are"} now yours.
      </p>

      {/* Email confirmation notice */}
      <div
        className="mt-8 flex items-start gap-4 p-5"
        style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
      >
        <MailCheck size={20} className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
            Confirmation sent to {email || "your email"}
          </p>
          <p className="mt-1 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
            We&apos;ve emailed your receipt and this account setup link. (Demo — no real email is sent.)
          </p>
        </div>
      </div>

      {/* Account creation */}
      <div
        className="mt-6 p-6 sm:p-8"
        style={{ background: "var(--color-surface-container-low)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline)" }}
      >
        <h2 className="headline-sm mb-2" style={{ fontSize: "1.35rem" }}>Create your account</h2>
        <p className="mb-6 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
          Set a password to manage your {ids.length === 1 ? "website" : "websites"} and RSVPs anytime.
        </p>

        <form onSubmit={handleCreate} className="space-y-5">
          <InputField label="Email" id="acct-email" value={email} readOnly disabled />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputField
              label="Password"
              id="acct-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              error={error && password.length < 6 ? error : undefined}
            />
            <InputField
              label="Confirm password"
              id="acct-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(""); }}
              error={error && password.length >= 6 ? error : undefined}
            />
          </div>
          <ButtonPrimary type="submit" size="lg" fullWidth>
            Create account &amp; open dashboard
          </ButtonPrimary>
        </form>

        <p className="mt-5 text-center text-sm font-light" style={{ color: "var(--color-on-surface-variant)" }}>
          Already have an account?{" "}
          <Link href="/login" className="transition-colors hover:opacity-70" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Loading…</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
