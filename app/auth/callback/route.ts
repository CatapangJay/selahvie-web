import { NextResponse, type NextRequest } from "next/server";
import type { AuthError, EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/supabase/config";

/**
 * Landing point for Supabase email links (sign-up confirmation, magic link,
 * password recovery). Handles both the PKCE `code` flow and `token_hash` links.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeRedirectPath(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const toLogin = (notice: "link" | "confirmed") => {
    const url = new URL("/login", origin);
    url.searchParams.set(notice === "link" ? "error" : "notice", notice);
    if (next !== "/dashboard") url.searchParams.set("redirect", next);
    return NextResponse.redirect(url);
  };

  // Supabase redirects here with an error when its own verification fails
  // (token already used, expired, or the redirect URL isn't allow-listed).
  if (searchParams.get("error") || searchParams.get("error_code")) {
    console.error("[auth/callback] Supabase rejected the link:", searchParams.get("error_code"), searchParams.get("error_description"));
    return toLogin("link");
  }

  let error: AuthError | null = null;
  if (code) {
    ({ error } = await (await createClient()).auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await (await createClient()).auth.verifyOtp({ type, token_hash: tokenHash }));
  } else {
    console.error("[auth/callback] No code or token_hash in the link");
    return toLogin("link");
  }

  if (!error) return NextResponse.redirect(`${origin}${next}`);

  console.error("[auth/callback] Link exchange failed:", error.name, error.message);
  // The link was valid and the email is now confirmed, but it was opened in a
  // different browser than the one that signed up, so there's no PKCE verifier
  // to finish signing in with. Ask them to log in instead of showing an error.
  if (error.name === "AuthPKCECodeVerifierMissingError") return toLogin("confirmed");
  return toLogin("link");
}
