import { resolveCountryRouteCodeFromCountry } from "@/features/services/lib/country-match";
import type { Country } from "@/features/services/types";
import { routing } from "@/i18n/routing";

export type CountryRouteCode = "SA" | "OM";

export const COUNTRY_ROUTE_SEGMENT: Record<CountryRouteCode, string | null> = {
  SA: null,
  OM: "om",
};

export function resolveSupportedCountry(value: string | undefined): CountryRouteCode {
  const normalized = value?.trim().toUpperCase();
  return normalized === "OM" ? "OM" : "SA";
}

/** Strips Oman route segments (`/om`, `/en/om`) and returns the route country code. */
export function parseCountryPath(pathname: string): {
  countryCode: CountryRouteCode;
  pathname: string;
} {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalized === "/en/om" || normalized.startsWith("/en/om/")) {
    const rest = normalized === "/en/om" ? "" : normalized.slice(6);
    const intlPath = rest ? `/en${rest}` : "/en";
    return { countryCode: "OM", pathname: intlPath };
  }

  if (normalized === "/om" || normalized.startsWith("/om/")) {
    const rest = normalized === "/om" ? "/" : normalized.slice(3) || "/";
    return { countryCode: "OM", pathname: rest };
  }

  return { countryCode: "SA", pathname: normalized };
}

/** Locale-neutral path for next-intl (`/services`, not `/om/services`). */
export function stripCountryFromPathname(pathname: string): string {
  return parseCountryPath(pathname).pathname;
}

/** Strips `/en` for `localePrefix: 'as-needed'` (default locale has no prefix). */
export function stripLocalePrefixFromPath(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  for (const loc of routing.locales) {
    if (loc === routing.defaultLocale) continue;
    const prefix = `/${loc}`;
    if (normalized === prefix) return "/";
    if (normalized.startsWith(`${prefix}/`)) {
      return normalized.slice(prefix.length) || "/";
    }
  }
  return normalized;
}

/** Country- and locale-neutral path from a browser URL (`/en/om/services/x` → `/services/x`). */
export function logicalRoutePathFromUrl(urlPathname: string): string {
  return stripLocalePrefixFromPath(parseCountryPath(urlPathname).pathname);
}

/** Legacy Oman English URLs (`/om/en`, `/om/en/...`) before `/en/om` routing. */
export function isLegacyOmanEnglishPath(pathname: string): boolean {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized === "/om/en" || normalized.startsWith("/om/en/");
}

/** Maps a legacy `/om/en/...` path to `/en/om/...`. */
export function migrateLegacyOmanEnglishPath(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/om/en") return "/en/om";
  if (normalized.startsWith("/om/en/")) {
    return `/en/om${normalized.slice(6)}`;
  }
  return normalized;
}

/**
 * Prepends Oman route segments:
 * - Arabic (default locale): `/om`, `/om/services`, …
 * - English: `/en/om`, `/en/om/services`, …
 */
export function withCountryPrefix(
  countryCode: CountryRouteCode,
  pathname: string,
): string {
  if (countryCode === "SA") return pathname;

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalized === "/en" || normalized === "/en/" || normalized.startsWith("/en/")) {
    const rest =
      normalized === "/en" || normalized === "/en/" ? "" : normalized.slice(3);
    return rest ? `/en/om${rest}` : "/en/om";
  }

  if (normalized === "/") return "/om";
  return `/om${normalized}`;
}

/** Maps a CMS country record to a supported route code when possible. */
export function countryRouteCodeFromApiCountry(
  country: Country,
): CountryRouteCode | null {
  return resolveCountryRouteCodeFromCountry(country);
}

export function countryRouteCodeFromId(
  countries: Country[],
  countryId: number,
): CountryRouteCode {
  const country = countries.find((item) => item.id === countryId);
  if (!country) return "SA";
  return countryRouteCodeFromApiCountry(country) ?? "SA";
}
