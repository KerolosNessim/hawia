import type { Country } from "../types";

export const COUNTRY_CODE_ALIASES: Record<string, string[]> = {
  SA: ["saudi", "ksa", "سعود", "السعود"],
  OM: ["oman", "عمان"],
  EG: ["egypt", "مصر"],
  AE: ["uae", "emirates", "امارات", "إمارات"],
  QA: ["qatar", "قطر"],
  KW: ["kuwait", "كويت"],
  BH: ["bahrain", "بحرين"],
};

/** Picks a default country tab from geo cookie code and API country names. */
export function matchCountryByUserCode(
  countries: Country[],
  userCountryCode: string,
): Country | undefined {
  if (!countries.length) return undefined;

  const currentAliases = COUNTRY_CODE_ALIASES[userCountryCode] || [];
  let matched = countries.find((c) =>
    currentAliases.some((alias) => c.name.toLowerCase().includes(alias)),
  );

  if (!matched) {
    matched = countries.find(
      (c) => c.name.toLowerCase().includes("oman") || c.name.includes("عمان"),
    );
  }

  return matched ?? countries[0];
}
