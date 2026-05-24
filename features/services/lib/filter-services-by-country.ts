import type { Service, ServiceCountry } from "../types";
import { COUNTRY_CODE_ALIASES } from "./country-match";

function countryMatchesAliases(
  country: ServiceCountry,
  aliases: string[],
): boolean {
  if (!aliases.length) return false;
  const ar = (country.name?.ar ?? "").toLowerCase();
  const en = (country.name?.en ?? "").toLowerCase();
  return aliases.some((alias) => {
    const a = alias.toLowerCase();
    return ar.includes(a) || en.includes(a);
  });
}

function filterByCountryCode(services: Service[], code: string): Service[] {
  const aliases = COUNTRY_CODE_ALIASES[code] ?? [];
  if (!aliases.length) return [];
  return services.filter((s) =>
    s.countries?.some((c) => countryMatchesAliases(c, aliases)),
  );
}

/**
 * Services for nav/footer: match visitor country, then common fallbacks, then all listed services.
 */
export function filterServicesByCountryCode(
  services: Service[],
  userCountryCode: string,
): Service[] {
  if (!services.length) return [];

  const user = filterByCountryCode(services, userCountryCode);
  if (user.length > 0) return user;

  for (const fallbackCode of ["OM", "SA", "AE", "EG"]) {
    const matched = filterByCountryCode(services, fallbackCode);
    if (matched.length > 0) return matched;
  }

  return services;
}
