/**
 * Loads a wedding theme's fonts in the browser: the template's stylesheet (when
 * the app doesn't already ship its fonts), then the faces themselves, so text
 * and canvas drawing (signs) use the template's type. Browser only.
 */
import type { GuestTheme } from "@/lib/weddingTheme";

const sheets = new Map<string, Promise<void>>();

function loadSheet(href: string): Promise<void> {
  const cached = sheets.get(href);
  if (cached) return cached;
  const p = new Promise<void>((resolve) => {
    const existing = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].find((l) => l.href === href);
    if (existing?.sheet) return resolve();
    const link = existing ?? document.createElement("link");
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener("error", () => resolve(), { once: true });
    if (!existing) {
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  });
  sheets.set(href, p);
  return p;
}

/** First family in a CSS stack: `'Gloock', Didot, serif` → `Gloock`. */
export const firstFamily = (stack: string) => stack.split(",")[0].trim().replace(/^['"]|['"]$/g, "");

export async function loadThemeFonts(theme: Pick<GuestTheme, "serif" | "sans" | "script" | "fontsHref">): Promise<void> {
  if (typeof document === "undefined") return;
  if (theme.fontsHref) await loadSheet(theme.fontsHref);
  const serif = firstFamily(theme.serif);
  const sans = firstFamily(theme.sans);
  const faces = [`400 120px "${serif}"`, `italic 400 120px "${serif}"`, `500 60px "${sans}"`, `400 60px "${sans}"`];
  if (theme.script) faces.push(`400 120px "${firstFamily(theme.script)}"`);
  await Promise.all(faces.map((f) => document.fonts?.load(f).catch(() => undefined)));
}
