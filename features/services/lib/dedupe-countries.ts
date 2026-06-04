import type { Country } from "../types";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

function countryNameForKey(country: Pick<Country, "name">): string {
  const raw = country.name as unknown;
  if (typeof raw === "string") return normalizeText(raw.trim());
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const localized = raw as { ar?: unknown; en?: unknown };
    const ar = typeof localized.ar === "string" ? localized.ar : "";
    const en = typeof localized.en === "string" ? localized.en : "";
    return normalizeText((ar || en).trim());
  }
  return "";
}

function preferCountry(a: Country, b: Country): Country {
  const aHasImage = Boolean(a.image?.trim());
  const bHasImage = Boolean(b.image?.trim());
  if (aHasImage && !bHasImage) return a;
  if (bHasImage && !aHasImage) return b;
  return a.id <= b.id ? a : b;
}

export function buildCountryIdAliasMap(countries: Country[]): Map<number, number> {
  const groups = new Map<string, Country[]>();

  for (const country of countries) {
    const key = countryNameForKey(country);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(country);
    groups.set(key, list);
  }

  const alias = new Map<number, number>();
  for (const group of groups.values()) {
    const canonical = group.reduce(preferCountry);
    for (const country of group) {
      alias.set(country.id, canonical.id);
    }
  }

  return alias;
}

export function dedupeCountries(countries: Country[]): Country[] {
  const byKey = new Map<string, Country>();

  for (const country of countries) {
    const key = countryNameForKey(country);
    if (!key) continue;
    const existing = byKey.get(key);
    byKey.set(key, existing ? preferCountry(existing, country) : country);
  }

  return Array.from(byKey.values()).sort((a, b) => a.id - b.id);
}

export function resolveCanonicalCountryId(
  id: number,
  alias: Map<number, number>,
): number {
  return alias.get(id) ?? id;
}

export function countryIdsMatch(
  a: number,
  b: number,
  alias: Map<number, number>,
): boolean {
  return resolveCanonicalCountryId(a, alias) === resolveCanonicalCountryId(b, alias);
}
