import type { Country } from "../types";
import {
  buildCountryIdAliasMap,
  dedupeCountries,
  resolveCanonicalCountryId,
} from "./dedupe-countries";

export type PreparedCountries = {
  countries: Country[];
  idAlias: Map<number, number>;
};

export function unwrapCountries(payload: unknown): Country[] {
  if (Array.isArray(payload)) return payload as Country[];
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as Country[];
    if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
      return (data as { data: Country[] }).data;
    }
  }
  return [];
}

export function prepareCountriesList(raw: Country[]): PreparedCountries {
  const active = raw.filter((country) => country.is_active !== false);
  const pool = active.length > 0 ? active : raw;
  const idAlias = buildCountryIdAliasMap(pool);
  const countries = dedupeCountries(pool);

  return { countries, idAlias };
}

function countryNameText(country: Country): string {
  const raw = country.name as unknown;
  if (typeof raw === "string") return raw.toLowerCase();
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const localized = raw as { ar?: unknown; en?: unknown };
    return [localized.en, localized.ar]
      .filter((value): value is string => typeof value === "string")
      .join(" ")
      .toLowerCase();
  }
  return "";
}

function defaultSaudiCountryId(prepared: PreparedCountries): number | undefined {
  const sa = prepared.countries.find((country) => {
    const name = countryNameText(country);
    return (
      name.includes("saudi") ||
      name.includes("ksa") ||
      name.includes("\u0627\u0644\u0633\u0639\u0648\u062f")
    );
  });
  return sa?.id ?? prepared.countries[0]?.id;
}

export function resolveSelectedCountryId(
  countryId: number | undefined,
  prepared: PreparedCountries,
): number | undefined {
  if (countryId == null || countryId <= 0) return undefined;

  const canonical = resolveCanonicalCountryId(countryId, prepared.idAlias);
  if (prepared.countries.some((country) => country.id === canonical)) {
    return canonical;
  }

  return defaultSaudiCountryId(prepared);
}
