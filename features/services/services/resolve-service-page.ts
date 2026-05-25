import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { normalizeSingleService } from "../lib/normalize-single-service";
import {
  isGoneStatus,
  isPermanentRedirectStatus,
  parseServiceSlugRedirect,
} from "../lib/service-slug-redirect";
import type { SingleService } from "../types";
import { fetchServiceRow } from "./get-single-service";

export type ServicePageResolveResult =
  | { kind: "ok"; data: SingleService }
  | { kind: "redirect"; toSlug: string; status: number }
  | { kind: "gone"; status: number };

/**
 * Loads a service for the public detail page, including slug redirect metadata.
 */
export async function resolveServicePage(
  slug: string,
  locale: string,
): Promise<ServicePageResolveResult | null> {
  const decoded = decodePathSegment(slug);
  const row = await fetchServiceRow(decoded);
  if (!row) return null;

  const redirect = parseServiceSlugRedirect(row, decoded, locale);
  if (redirect) {
    if (isGoneStatus(redirect.status)) {
      return { kind: "gone", status: redirect.status };
    }
    if (redirect.toSlug && redirect.toSlug !== decoded) {
      return { kind: "redirect", toSlug: redirect.toSlug, status: redirect.status };
    }
  }

  return {
    kind: "ok",
    data: normalizeSingleService(row, locale),
  };
}

export { isGoneStatus, isPermanentRedirectStatus };
