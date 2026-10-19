"use client";

import ButtonTertiary from "@/components/ui/ButtonTertiary";
import { useAuthStore } from "@/store/authStore";
import { useWeddingStore } from "@/store/weddingStore";

/** Tells the owner when their websites couldn't be loaded or a change couldn't be saved. */
export default function SyncNotice() {
  const status = useWeddingStore((s) => s.status);
  const error = useWeddingStore((s) => s.error);
  const dismissError = useWeddingStore((s) => s.dismissError);
  const account = useAuthStore((s) => s.account);
  if (!error) return null;

  const retry = () => {
    if (account) void useWeddingStore.getState().load({ id: account.id, email: account.email });
  };

  return (
    <div
      role="alert"
      className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm"
      style={{ background: "var(--color-error-container)", color: "var(--color-error)" }}
    >
      <span>{error}</span>
      {status === "error" ? (
        <ButtonTertiary type="button" onClick={retry}>Try again</ButtonTertiary>
      ) : (
        <ButtonTertiary type="button" onClick={dismissError}>Dismiss</ButtonTertiary>
      )}
    </div>
  );
}
