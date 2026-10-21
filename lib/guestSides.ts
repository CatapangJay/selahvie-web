import type { GuestSide, WeddingConfig } from "@/types/wedding";

/** Dot colours for each side (partner 1 rose, partner 2 sage). */
export const SIDE_COLOR: Record<GuestSide | "none", string> = {
  partner1: "var(--color-primary)",
  partner2: "var(--sage)",
  none: "var(--color-on-surface-muted)",
};

export function partnerNames(config: Pick<WeddingConfig, "partner1Name" | "partner2Name"> | undefined) {
  return {
    p1: config?.partner1Name?.trim() || "Partner 1",
    p2: config?.partner2Name?.trim() || "Partner 2",
  };
}

/** "Ana's side", or `unset` when no side is chosen. */
export function sideLabel(
  config: Pick<WeddingConfig, "partner1Name" | "partner2Name"> | undefined,
  side: GuestSide | undefined,
  unset = "Side not set"
): string {
  const { p1, p2 } = partnerNames(config);
  return side === "partner1" ? `${p1}'s side` : side === "partner2" ? `${p2}'s side` : unset;
}

/** Options for a side picker. The empty value means "not set". */
export function sideOptions(
  config: Pick<WeddingConfig, "partner1Name" | "partner2Name"> | undefined,
  unset = "Side not set"
): { value: "" | GuestSide; label: string }[] {
  return [
    { value: "", label: unset },
    { value: "partner1", label: sideLabel(config, "partner1") },
    { value: "partner2", label: sideLabel(config, "partner2") },
  ];
}

export const asSide = (v: string): GuestSide | undefined =>
  v === "partner1" || v === "partner2" ? v : undefined;

/**
 * Reads a side from a spreadsheet cell: a partner's name ("Ana", "Ana's side"),
 * "1"/"2", or "partner1"/"partner2". Anything else is left unset.
 */
export function parseSide(
  cell: string,
  config: Pick<WeddingConfig, "partner1Name" | "partner2Name"> | undefined
): GuestSide | undefined {
  const v = cell.trim().toLowerCase().replace(/['’]s side$|\s+side$/, "").trim();
  if (!v) return undefined;
  if (v === "1" || v === "partner1" || v === "partner 1") return "partner1";
  if (v === "2" || v === "partner2" || v === "partner 2") return "partner2";
  const first = (name?: string) => name?.trim().toLowerCase().split(/\s+/)[0] ?? "";
  const n1 = first(config?.partner1Name);
  const n2 = first(config?.partner2Name);
  const hit = (n: string) => n !== "" && (v === n || v.split(/\s+/)[0] === n);
  if (hit(n1) && !hit(n2)) return "partner1";
  if (hit(n2) && !hit(n1)) return "partner2";
  return undefined;
}
