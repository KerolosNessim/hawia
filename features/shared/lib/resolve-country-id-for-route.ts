import { resolveCountryRouteCodeFromCountry } from "@/features/services/lib/country-match";
import type { Country } from "@/features/services/types";
import type { CountryRouteCode } from "@/features/shared/lib/country-routes";

export function resolveCountryIdForRoute(
  countries: Country[],
  routeCode: CountryRouteCode,
): number | undefined {
  return countries.find(
    (country) => resolveCountryRouteCodeFromCountry(country) === routeCode,
  )?.id;
}
