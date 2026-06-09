import type { SectionItem } from "../types";

function sortOrderValue(item: SectionItem): number {
  const n = Number.parseInt(String(item.sort_order ?? "0"), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Offerings / steps cards: ascending `sort_order` (1, 2, 3…). */
export function orderSectionItemsForDisplay(
  items: SectionItem[] | null | undefined,
): SectionItem[] {
  if (!items?.length) return [];
  return [...items].sort((a, b) => sortOrderValue(a) - sortOrderValue(b));
}
