"use client";

import Link from "next/link";
import ButtonPrimary from "@/components/ui/ButtonPrimary";
import ButtonSecondary from "@/components/ui/ButtonSecondary";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const ids = params.get("ids")?.split(",") ?? [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      {/* Celebration */}
      <div className="mb-8 text-6xl">💍</div>
      <p className="label-luxury mb-4" style={{ color: "var(--color-tertiary)" }}>Purchase Confirmed</p>
      <h1
        className="headline-md"
        style={{ fontFamily: "var(--font-noto-serif, var(--font-serif))" }}
      >
        Your templates are ready
      </h1>
      <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
        Congratulations! Your wedding website templates have been unlocked. Head to your dashboard to start personalizing every detail of your special day.
      </p>

      <div
        className="mt-10 rounded-2xl p-6 text-left"
        style={{ background: "var(--color-surface-container-low)" }}
      >
        <p className="label-luxury mb-4" style={{ color: "var(--color-on-surface-variant)" }}>
          {ids.length} template{ids.length !== 1 ? "s" : ""} purchased
        </p>
        <ul className="space-y-2">
          {ids.map((id, i) => (
            <li key={id} className="flex items-center gap-3 text-sm" style={{ color: "var(--color-on-surface)" }}>
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "var(--color-secondary)" }}
              >
                ✓
              </span>
              Wedding Website #{i + 1}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/dashboard">
          <ButtonPrimary size="lg">Customize Your Website Now</ButtonPrimary>
        </Link>
        <Link href="/templates">
          <ButtonSecondary size="lg">Browse More Templates</ButtonSecondary>
        </Link>
      </div>

      <p className="mt-8 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
        A confirmation has been sent to your email address.
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-24">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
