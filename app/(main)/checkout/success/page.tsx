"use client";

import Link from "next/link";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Check } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const ids = params.get("ids")?.split(",") ?? [];

  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      {/* Icon */}
      <div
        className="flex h-14 w-14 items-center justify-center mb-8"
        style={{
          background: "var(--color-primary-container)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-outline-variant)",
        }}
      >
        <Check size={20} style={{ color: "var(--color-primary)" }} strokeWidth={1.5} />
      </div>

      <p className="label-luxury mb-4" style={{ color: "var(--color-on-surface-muted)" }}>
        Purchase confirmed
      </p>
      <h1 className="headline-md" style={{ fontWeight: 300 }}>
        Your templates are ready
      </h1>
      <p
        className="mt-5 text-sm font-light leading-relaxed"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        Your wedding website templates have been unlocked. Head to your dashboard to start
        personalizing every detail of your special day.
      </p>

      <div
        className="mt-10 p-6"
        style={{
          background: "var(--color-surface-container)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-outline)",
        }}
      >
        <p className="label-luxury mb-5" style={{ color: "var(--color-on-surface-muted)" }}>
          {ids.length} template{ids.length !== 1 ? "s" : ""} purchased
        </p>
        <ul className="space-y-3">
          {ids.map((id, i) => (
            <li key={id} className="flex items-center gap-3 text-sm font-light" style={{ color: "var(--color-on-surface)" }}>
              <span
                className="flex h-5 w-5 items-center justify-center shrink-0"
                style={{
                  background: "var(--color-primary-container)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <Check size={10} style={{ color: "var(--color-primary)" }} />
              </span>
              Wedding website #{i + 1}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard">
          <ButtonPrimary size="lg">Customize your website</ButtonPrimary>
        </Link>
        <Link href="/templates">
          <ButtonSecondary size="lg">Browse more templates</ButtonSecondary>
        </Link>
      </div>

      <p className="mt-8 label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>
        A confirmation has been sent to your email address.
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 label-luxury" style={{ color: "var(--color-on-surface-muted)" }}>Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
