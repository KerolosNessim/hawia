import { matchCountryByUserCode } from "./country-match";
import type { Country, ServiceCountry } from "../types";

/**
 * Picks the country context for a service detail page and related-services fetch.
 *
 * Priority:
 * 1. `country_id` query param when it belongs to this service
 * 2. Visitor geo cookie matched against the service's countries
 * 3. First country assigned to the service
 * 4. Visitor geo / first country from the global countries list (service has no countries)
 */
export function resolveServiceCountryId(params: {
  serviceCountries: ServiceCountry[];
  urlCountryId?: number;
  allCountries?: Country[];
  userCountryCode?: string;
}): number | undefined {
  const { serviceCountries, urlCountryId, allCountries = [], userCountryCode } = params;

  if (urlCountryId != null && urlCountryId > 0) {
    if (
      serviceCountries.length === 0 ||
      serviceCountries.some((c) => c.id === urlCountryId)
    ) {
      return urlCountryId;
    }
  }

  const code = userCountryCode?.trim() || "SA";

  if (serviceCountries.length > 0 && allCountries.length > 0) {
    const serviceIds = new Set(serviceCountries.map((c) => c.id));
    const eligible = allCountries.filter((c) => serviceIds.has(c.id));
    const matched = matchCountryByUserCode(eligible, code);
    if (matched) return matched.id;
    return serviceCountries[0]?.id;
  }

  if (serviceCountries.length > 0) {
    return serviceCountries[0].id;
  }

  if (allCountries.length > 0) {
    return matchCountryByUserCode(allCountries, code)?.id ?? allCountries[0].id;
  }

  return undefined;
}
