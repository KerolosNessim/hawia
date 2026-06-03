import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { normalizeSingleService } from "../lib/normalize-single-service";
import {
  isGoneStatus,
  isPermanentRedirectStatus,
  parseSlugRedirect,
} from "@/features/shared/lib/slug-redirect";
import type { SingleService } from "../types";
import { resolveServiceRow } from "./get-single-service";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

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
  const row = await resolveServiceRow(slug, locale);
  if (!row) return null;

  const redirectRec = asRecord(row.redirect);
  if (redirectRec && row.id == null && row.slug == null) {
    const status = Number(redirectRec.status ?? redirectRec.code ?? 0);
    const toSlug = String(redirectRec.to_slug ?? redirectRec.toSlug ?? "").trim();
    if (isGoneStatus(status)) {
      return { kind: "gone", status };
    }
    if (toSlug && toSlug !== decoded) {
      return { kind: "redirect", toSlug, status: status || 301 };
    }
    return null;
  }

  const redirect = parseSlugRedirect(row, decoded, locale);
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
