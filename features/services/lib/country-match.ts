import type { Country } from "../types";

export const COUNTRY_CODE_ALIASES: Record<string, string[]> = {
  SA: ["saudi", "ksa"],
  OM: ["oman"],
  EG: ["egypt"],
  AE: ["uae", "emirates"],
  QA: ["qatar"],
  KW: ["kuwait"],
  BH: ["bahrain"],
};

function countryNameText(country: Country): string {
  const raw = country.name as unknown;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const localized = raw as { ar?: unknown; en?: unknown };
    return [localized.en, localized.ar]
      .filter((value): value is string => typeof value === "string")
      .join(" ");
  }
  return "";
}

/** Picks a default country tab from geo cookie code and API country names. */
export function matchCountryByUserCode(
  countries: Country[],
  userCountryCode: string,
): Country | undefined {
  if (!countries.length) return undefined;

  const normalizedCode = userCountryCode.trim().toUpperCase();
  const currentAliases = COUNTRY_CODE_ALIASES[normalizedCode] || [];
  let matched = countries.find((country) => {
    const name = countryNameText(country).toLowerCase();
    return currentAliases.some((alias) => name.includes(alias));
  });

  if (!matched) {
    const saAliases = COUNTRY_CODE_ALIASES.SA;
    matched = countries.find((country) => {
      const name = countryNameText(country).toLowerCase();
      return saAliases.some((alias) => name.includes(alias));
    });
  }

  return matched ?? countries[0];
}
