import type { Country } from "../types";

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

const SA_ALIASES = [
  "sa",
  "sau",
  "saudi",
  "ksa",
  "\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629",
  "\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0647",
  "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629",
].map(normalizeText);

const OM_ALIASES = [
  "om",
  "omn",
  "oman",
  "\u0639\u0645\u0627\u0646",
  "\u0639\u064f\u0645\u0627\u0646",
  "\u0633\u0644\u0637\u0646\u0629 \u0639\u0645\u0627\u0646",
].map(normalizeText);

function canonicalCountryKey(text: string): string | null {
  if (!text) return null;
  if (SA_ALIASES.some((alias) => text.includes(alias))) return "SA";
  if (OM_ALIASES.some((alias) => text.includes(alias))) return "OM";
  return null;
}

function countryNameForKey(country: Pick<Country, "name">): string {
  const raw = country.name as unknown;
  if (typeof raw === "string") {
    const text = normalizeText(raw.trim());
    return canonicalCountryKey(text) ?? text;
  }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const localized = raw as { ar?: unknown; en?: unknown };
    const ar = typeof localized.ar === "string" ? localized.ar : "";
    const en = typeof localized.en === "string" ? localized.en : "";
    const text = normalizeText(`${ar} ${en}`);
    return canonicalCountryKey(text) ?? normalizeText((ar || en).trim());
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
