"use client";

import { useWeddingStore } from "@/store/weddingStore";
import { useAuthStore } from "@/store/authStore";
import type { WeddingConfig } from "@/types/wedding";

/**
 * A wedding config by id, but only if the signed-in account owns it. Returns
 * undefined for unknown ids and for websites that belong to someone else, so
 * callers can treat both as "not found".
 */
export function useOwnedConfig(id: string): WeddingConfig | undefined {
  const config = useWeddingStore((s) => s.configs[id]);
  const email = useAuthStore((s) => s.sessionEmail);
  return config && email && config.ownerEmail === email ? config : undefined;
}
