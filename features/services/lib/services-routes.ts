import { localePath } from "@/features/blogs/lib/blog-routes";
import {
  type CountryRouteCode,
  countryRouteCodeFromId,
  withCountryPrefix,
} from "@/features/shared/lib/country-routes";
import type { Locale } from "next-intl";
import type { Country, Service } from "../types";

export function pickServiceSlug(
  service: Pick<Service, "slug"> & { slug_local?: { ar?: string; en?: string } },
  locale: string,
): string {
  const key = locale === "ar" ? "ar" : "en";
  const local = service.slug_local?.[key] ?? service.slug_local?.ar ?? service.slug_local?.en;
  return (local ?? service.slug ?? "").trim();
}

/** Locale-neutral service detail path for next-intl `Link` / `getPathname`. */
export function serviceDetailPath(slug: string): string {
  return `/services/${encodeURIComponent(slug)}`;
}

export function servicePostPath(
  slug: string,
  opts?: { countryCode?: CountryRouteCode },
): string {
  return withCountryPrefix(opts?.countryCode ?? "SA", serviceDetailPath(slug));
}

export function servicePostHref(
  locale: Locale,
  slug: string,
  countryCode: CountryRouteCode = "SA",
): string {
  return localePath(locale, `/services/${encodeURIComponent(slug)}`, countryCode);
}

/** Path without locale prefix — use with `@/i18n/navigation` `Link`. */
export function servicesIndexPath(
  page: number,
  opts?: { countryCode?: CountryRouteCode },
): string {
  const p = new URLSearchParams();
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  const base = q ? `/services?${q}` : "/services";
  return withCountryPrefix(opts?.countryCode ?? "SA", base);
}

export function servicesIndexHref(
  locale: Locale,
  page: number,
  opts?: { countryCode?: CountryRouteCode },
): string {
  return localePath(locale, servicesIndexPath(page, opts));
}

export function servicesCountryHref(
  countries: Country[],
  countryId: number,
  page = 1,
): string {
  const countryCode = countryRouteCodeFromId(countries, countryId);
  return servicesIndexPath(page, { countryCode });
}
