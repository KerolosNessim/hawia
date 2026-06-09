import type { ContactHeader } from "../types";

/** Active contact headers sorted by `sort_order`. */
export function pickActiveContactHeaders(headers: ContactHeader[]): ContactHeader[] {
  return headers
    .filter((header) => header.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function pickPrimaryContactHeader(
  headers: ContactHeader[],
): ContactHeader | undefined {
  return pickActiveContactHeaders(headers)[0];
}
