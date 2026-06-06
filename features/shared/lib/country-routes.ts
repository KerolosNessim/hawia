import { matchCountryByUserCode } from "@/features/services/lib/country-match";
import type { Country } from "@/features/services/types";

export type CountryRouteCode = "SA" | "OM";

export const COUNTRY_ROUTE_SEGMENT: Record<CountryRouteCode, string | null> = {
  SA: null,
  OM: "om",
};

export function resolveSupportedCountry(value: string | undefined): CountryRouteCode {
  const normalized = value?.trim().toUpperCase();
  return normalized === "OM" ? "OM" : "SA";
}

/** Strips a leading `/om` segment and returns the route country code. */
export function parseCountryPath(pathname: string): {
  countryCode: CountryRouteCode;
  pathname: string;
} {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (normalized === "/om" || normalized.startsWith("/om/")) {
    const rest = normalized === "/om" ? "/" : normalized.slice(3) || "/";
    return { countryCode: "OM", pathname: rest };
  }

  return { countryCode: "SA", pathname: normalized };
}

/** Prepends `/om` when the route targets Oman (`/om`, `/om/en`, `/om/services`, …). */
export function withCountryPrefix(
  countryCode: CountryRouteCode,
  pathname: string,
): string {
  if (countryCode === "SA") return pathname;

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/") return "/om";
  return `/om${normalized}`;
}

/** Maps a CMS country record to a supported route code when possible. */
export function countryRouteCodeFromApiCountry(
  country: Country,
): CountryRouteCode | null {
  if (matchCountryByUserCode([country], "OM")?.id === country.id) return "OM";
  if (matchCountryByUserCode([country], "SA")?.id === country.id) return "SA";
  return null;
}

export function countryRouteCodeFromId(
  countries: Country[],
  countryId: number,
): CountryRouteCode {
  const country = countries.find((item) => item.id === countryId);
  if (!country) return "SA";
  return countryRouteCodeFromApiCountry(country) ?? "SA";
}
