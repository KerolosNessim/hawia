import type { Country } from "../types";

export const COUNTRY_CODE_ALIASES: Record<string, string[]> = {
  SA: [
    "sa",
    "sau",
    "saudi",
    "ksa",
    "\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629",
    "\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0647",
    "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629",
  ],
  OM: [
    "om",
    "omn",
    "oman",
    "\u0639\u0645\u0627\u0646",
    "\u0639\u064f\u0645\u0627\u0646",
    "\u0633\u0644\u0637\u0646\u0629 \u0639\u0645\u0627\u0646",
  ],
  EG: ["egypt"],
  AE: ["uae", "emirates"],
  QA: ["qatar"],
  KW: ["kuwait"],
  BH: ["bahrain"],
};

function countryCodeText(country: Country): string {
  const raw = country as Country & {
    code?: unknown;
    iso_code?: unknown;
    country_code?: unknown;
  };
  return [raw.code, raw.iso_code, raw.country_code]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
}

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

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627")
    .replace(/\u0649/g, "\u064a")
    .replace(/\u0629/g, "\u0647")
    .replace(/\s+/g, " ")
    .trim();
}

function countrySearchText(country: Country): string {
  return normalizeText(`${countryCodeText(country)} ${countryNameText(country)}`);
}

function countryMatchesAliases(country: Country, aliases: string[]): boolean {
  const text = countrySearchText(country);
  return aliases.some((alias) => text.includes(normalizeText(alias)));
}

/** Maps a single API country record to `SA` or `OM` without geo fallbacks. */
export function resolveCountryRouteCodeFromCountry(
  country: Country,
): "SA" | "OM" | null {
  if (countryMatchesAliases(country, COUNTRY_CODE_ALIASES.OM)) return "OM";
  if (countryMatchesAliases(country, COUNTRY_CODE_ALIASES.SA)) return "SA";
  return null;
}

/** Picks a default country tab from geo cookie code and API country names. */
export function matchCountryByUserCode(
  countries: Country[],
  userCountryCode: string,
): Country | undefined {
  if (!countries.length) return undefined;

  const normalizedCode = userCountryCode.trim().toUpperCase();
  const currentAliases = COUNTRY_CODE_ALIASES[normalizedCode] || [];
  let matched = countries.find((country) =>
    countryMatchesAliases(country, currentAliases),
  );

  if (!matched) {
    const saAliases = COUNTRY_CODE_ALIASES.SA;
    matched = countries.find((country) => countryMatchesAliases(country, saAliases));
  }

  return matched ?? countries[0];
}
