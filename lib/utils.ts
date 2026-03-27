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
