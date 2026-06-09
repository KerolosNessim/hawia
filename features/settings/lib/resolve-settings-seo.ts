import { getSettings } from "@/features/settings/services/settings-service";
import type { SettingSeo, SettingsData } from "@/features/settings/types";
import type { CountryRouteCode } from "@/features/shared/lib/country-routes";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";

/** Frontend route key → API `page_key` values (including legacy CMS keys). */
const PAGE_KEY_LOOKUP: Record<string, string[]> = {
  home: ["home"],
  om: ["om"],
  about: ["about"],
  services: ["services"],
  packages: ["packages"],
  clients: ["clients"],
  courses: ["courses", "dorat-hoy"],
  faq: ["faq"],
  blog: ["blog", "blogs", "almdonat"],
  author: ["author", "authors"],
  authors: ["author", "authors"],
  "contact-us": ["contact-us", "contact"],
  contact: ["contact", "contact-us"],
};

export type ResolvedSettingsSeo = {
  title?: string;
  description?: string;
  row: SettingSeo | null;
};

function normalizeMetaText(value: string | null | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const text = plainTextFromHtml(value);
  return text || undefined;
}

function findSeoRow(seo: SettingSeo[], pageKey: string): SettingSeo | null {
  const keys = PAGE_KEY_LOOKUP[pageKey] ?? [pageKey];
  for (const key of keys) {
    const row = seo.find((entry) => entry.page_key === key);
    if (row) return row;
  }
  return null;
}

function homeSeoFromGeneral(
  general: SettingsData["general"] & {
    home_meta_title?: string | null;
    home_meta_description?: string | null;
  },
): { title?: string; description?: string } {
  return {
    title:
      normalizeMetaText(general.home_meta_title) ||
      normalizeMetaText(general.site_name),
    description:
      normalizeMetaText(general.home_meta_description) ||
      normalizeMetaText(general.site_description),
  };
}

type ResolveSettingsPageSeoOptions = {
  /** When `home` on `/om`, prefer settings `page_key: "om"`. */
  countryRouteCode?: CountryRouteCode;
};

function resolveHomeSettingsSeo(
  seo: SettingSeo[],
  general: SettingsData["general"] & {
    home_meta_title?: string | null;
    home_meta_description?: string | null;
  },
  countryRouteCode?: CountryRouteCode,
): ResolvedSettingsSeo {
  const omRow = countryRouteCode === "OM" ? findSeoRow(seo, "om") : null;
  const homeRow = findSeoRow(seo, "home");
  const row = omRow ?? homeRow;
  const fromRow = row
    ? {
        title: normalizeMetaText(row.meta_title),
        description: normalizeMetaText(row.meta_description),
      }
    : {};
  const fromGeneral = homeSeoFromGeneral(general);
  return {
    row,
    title: fromRow.title || fromGeneral.title,
    description: fromRow.description || fromGeneral.description,
  };
}

export function resolveHomePageMeta(input: {
  countryRouteCode: CountryRouteCode;
  settingsSeo: ResolvedSettingsSeo | null;
  landingHeroSeo?: { meta_title?: string | null; meta_description?: string | null } | null;
  general: SettingsData["general"] & {
    home_meta_title?: string | null;
    home_meta_description?: string | null;
  };
}): { title: string; description?: string } {
  const heroTitle = input.landingHeroSeo?.meta_title?.trim();
  const heroDescription = input.landingHeroSeo?.meta_description?.trim();
  const settingsTitle = input.settingsSeo?.title?.trim();
  const settingsDescription = input.settingsSeo?.description?.trim();
  const generalTitle =
    input.general.home_meta_title?.trim() || input.general.site_name || "Howeyah";
  const generalDescription =
    input.general.home_meta_description?.trim() ||
    input.general.site_description?.trim() ||
    undefined;

  if (input.countryRouteCode === "OM") {
    return {
      title: settingsTitle || heroTitle || generalTitle,
      description: settingsDescription || heroDescription || generalDescription,
    };
  }

  return {
    title: heroTitle || settingsTitle || generalTitle,
    description: heroDescription || settingsDescription || generalDescription,
  };
}

/**
 * Resolves CMS SEO title/description for a public page from `GET /v1/settings`.
 * Strips HTML from rich-text meta fields before they go into `<title>` / `<meta>`.
 */
export async function resolveSettingsPageSeo(
  pageKey: string,
  options?: ResolveSettingsPageSeoOptions,
): Promise<ResolvedSettingsSeo | null> {
  try {
    const { data } = await getSettings();
    const general = data.general as SettingsData["general"] & {
      home_meta_title?: string | null;
      home_meta_description?: string | null;
    };

    if (pageKey === "home") {
      return resolveHomeSettingsSeo(data.seo, general, options?.countryRouteCode);
    }

    const row = findSeoRow(data.seo, pageKey);

    if (!row) return null;

    return {
      row,
      title: normalizeMetaText(row.meta_title),
      description: normalizeMetaText(row.meta_description),
    };
  } catch {
    return null;
  }
}
