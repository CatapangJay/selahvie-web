"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import Skeleton from "@/components/ui/Skeleton";

/**
 * Client-side auth gate for the authenticated app surfaces (dashboard, studio,
 * manage). Renders a skeleton until the Supabase session is known, then either
 * shows children or redirects to /login (preserving the intended path).
 *
 * The proxy already redirects anonymous requests server-side; this covers
 * client-side sign-out and session expiry while a page is open.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const resolved = status !== "loading";
  const authed = status === "authenticated";

  useEffect(() => {
    if (resolved && !authed) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [resolved, authed, pathname, router]);

  // Resolving or redirecting: show a calm skeleton, never protected content.
  if (!authed) {
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
