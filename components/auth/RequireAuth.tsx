"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { useHydrated } from "@/lib/useHydrated";
import Skeleton from "@/components/ui/Skeleton";

/**
 * Client-side auth gate for the authenticated app surfaces (dashboard, studio,
 * manage). Renders a skeleton until the persisted session is hydrated, then
 * either shows children or redirects to /login (preserving the intended path).
 *
 * Mock/V1: session lives in localStorage via authStore. Real route protection
 * lands with server auth in V2 (architecture.MD §10).
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const sessionEmail = useAuthStore((s) => s.sessionEmail);
  const authed = Boolean(sessionEmail);

  useEffect(() => {
    if (hydrated && !authed) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, authed, pathname, router]);

  // Pre-hydration or redirecting: show a calm skeleton, never protected content.
  if (!hydrated || !authed) {
    return (
      <div className="mx-auto max-w-7xl px-6" style={{ paddingTop: "var(--spacing-section)", paddingBottom: "var(--spacing-section-xl)" }}>
        <Skeleton className="mb-4 h-8 w-48" rounded="md" />
        <Skeleton className="mb-10 h-4 w-64" rounded="md" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72 w-full" rounded="md" />
          ))}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
