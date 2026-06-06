import { COUNTRY_CODE_ALIASES } from "@/features/services/lib/country-match";
import type { SettingsFooterCountry, SettingsFooterService } from "../types";

const FOOTER_COUNTRY_CODES = ["SA", "OM"] as const;

export type FooterCountryColumn = {
  code: (typeof FOOTER_COUNTRY_CODES)[number];
  id: number | null;
  name: string;
  services: SettingsFooterService[];
};

function countryTexts(country: SettingsFooterCountry): string[] {
  const { name } = country;
  if (typeof name === "string") return [name];
  return [name.ar, name.en].filter((n): n is string => Boolean(n?.trim()));
}

function countryMatchesCode(country: SettingsFooterCountry, code: string): boolean {
  const aliases = COUNTRY_CODE_ALIASES[code] ?? [];
  if (!aliases.length) return false;
  return countryTexts(country).some((text) => {
    const lower = text.toLowerCase();
    return aliases.some((alias) => lower.includes(alias.toLowerCase()));
  });
}

function resolveCountryName(
  country: SettingsFooterCountry | undefined,
  code: string,
  locale: string,
): string {
  if (country) {
    const { name } = country;
    if (typeof name === "string") return name;
    const isAr = locale.startsWith("ar");
    return (isAr ? name.ar : name.en) || name.ar || name.en || code;
  }

  const fallbacks: Record<string, { ar: string; en: string }> = {
    SA: { ar: "السعودية", en: "Saudi Arabia" },
    OM: { ar: "عُمان", en: "Oman" },
  };
  const fb = fallbacks[code];
  return locale.startsWith("ar") ? fb.ar : fb.en;
}

/** Groups `settings.footer.services` into SA and Oman columns for the site footer. */
export function groupFooterServicesByCountry(
  services: SettingsFooterService[] | undefined,
  locale: string,
): FooterCountryColumn[] {
  const list = services ?? [];

  return FOOTER_COUNTRY_CODES.map((code) => {
    const matched = list
      .filter((service) => service.countries?.some((c) => countryMatchesCode(c, code)))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    const countryMeta = list
      .flatMap((s) => s.countries ?? [])
      .find((c) => countryMatchesCode(c, code));

    return {
      code,
      id: countryMeta?.id ?? null,
      name: resolveCountryName(countryMeta, code, locale),
      services: matched,
    };
  });
}
