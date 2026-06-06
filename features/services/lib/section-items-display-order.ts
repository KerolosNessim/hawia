import type { SectionItem } from "../types";

function sortOrderValue(item: SectionItem): number {
  const n = Number.parseInt(String(item.sort_order ?? "0"), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Offerings / steps cards: show oldest entries first.
 * API + admin often assign `sort_order` 1 to the newest card, so ascending
 * alone puts 8 before 3; reversing fixes public display without re-saving CMS data.
 */
export function orderSectionItemsForDisplay(
  items: SectionItem[] | null | undefined,
): SectionItem[] {
  if (!items?.length) return [];
  const bySortOrder = [...items].sort(
    (a, b) => sortOrderValue(a) - sortOrderValue(b),
  );
  return bySortOrder.reverse();
}
