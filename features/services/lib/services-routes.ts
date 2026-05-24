import { localePath } from "@/features/blogs/lib/blog-routes";
import type { Locale } from "next-intl";
import type { Service } from "../types";

export function pickServiceSlug(
  service: Pick<Service, "slug"> & { slug_local?: { ar?: string; en?: string } },
  locale: string,
): string {
  const key = locale === "ar" ? "ar" : "en";
  const local = service.slug_local?.[key] ?? service.slug_local?.ar ?? service.slug_local?.en;
  return (local ?? service.slug ?? "").trim();
}

export function servicePostPath(slug: string): string {
  return `/services/${encodeURIComponent(slug)}`;
}

export function servicePostHref(locale: Locale, slug: string): string {
  return localePath(locale, servicePostPath(slug));
}

/** Path without locale prefix — use with `@/i18n/navigation` `Link`. */
export function servicesIndexPath(
  page: number,
  opts?: { countryId?: number },
): string {
  const p = new URLSearchParams();
  if (opts?.countryId != null && opts.countryId > 0) {
    p.set("country_id", String(opts.countryId));
  }
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  return q ? `/services?${q}` : "/services";
}

export function servicesIndexHref(
  locale: Locale,
  page: number,
  opts?: { countryId?: number },
): string {
  return localePath(locale, servicesIndexPath(page, opts));
}
