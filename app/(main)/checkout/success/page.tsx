"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Check, MailCheck } from "lucide-react";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import { useAuthStore } from "@/store/authStore";

function SuccessContent() {
  const params = useSearchParams();
  const ids = params.get("ids")?.split(",").filter(Boolean) ?? [];
  const method = params.get("method") ?? "card";
  const upgrades = Number(params.get("upgrades") ?? 0) || 0;

  const account = useAuthStore((s) => s.account);
  const firstName = account?.name.split(" ")[0];

  const methodLabel = method === "gcash" ? "GCash" : method === "maya" ? "Maya" : "card";

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
        You&apos;re all set{firstName ? `, ${firstName}` : ""}.
      </h1>
      <p className="mt-5 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
        Your payment via {methodLabel} went through.
        {ids.length > 0 && ` ${ids.length} wedding ${ids.length === 1 ? "website is" : "websites are"} now yours.`}
        {upgrades > 0 &&
          ` Personalized Invitations ${upgrades === 1 ? "is" : "are"} now unlocked. Open your guest list to send personal invite links.`}
      </p>

      {/* Receipt notice */}
      <div
        className="mt-8 flex items-start gap-4 p-5"
        style={{ background: "var(--color-surface-container)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline)" }}
      >
        <MailCheck size={20} className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
            Receipt sent to {account?.email ?? "your email"}
          </p>
          <p className="mt-1 text-sm font-light leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
            (Demo — no real email is sent.)
          </p>
        </div>
      </div>

      <div className="mt-8">
        {account ? (
          <Link href="/dashboard">
            <ButtonPrimary size="lg" fullWidth>
              Open your dashboard
            </ButtonPrimary>
          </Link>
        ) : (
          <Link href="/login?redirect=%2Fdashboard">
            <ButtonPrimary size="lg" fullWidth>
              Log in to open your dashboard
            </ButtonPrimary>
          </Link>
        )}
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
