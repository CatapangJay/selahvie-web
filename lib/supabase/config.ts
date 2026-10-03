/**
 * Public Supabase connection settings. `NEXT_PUBLIC_*` values are inlined at
 * build time, so they must be referenced statically (no dynamic lookup).
 */
export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local (see .env.example)."
    );
  }
  return { url, key };
}

/** Only allow same-origin relative paths as post-auth redirects (prevents open redirects). */
export function safeRedirectPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
