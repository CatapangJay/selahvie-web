import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatPrice(cents: number): string {
  return `₱${(cents / 100).toFixed(2)}`;
}

export function generateSlug(name1: string, name2: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return `${clean(name1)}-and-${clean(name2)}`;
}

/** Escape one CSV cell: quote when it contains comma, quote, or newline. */
function csvCell(value: string | number | boolean | undefined | null): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build CSV text from a header row and object rows (columns follow header order). */
export function toCsv(headers: string[], rows: (string | number | boolean | undefined | null)[][]): string {
  const lines = [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))];
  return lines.join("\r\n");
}

/** Trigger a client-side file download of text content. */
export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
