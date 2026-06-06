import { getSettings } from "@/features/settings/services/settings-service";
import type { SettingSeo, SettingsData } from "@/features/settings/types";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";

/** Frontend route key → API `page_key` values (including legacy CMS keys). */
const PAGE_KEY_LOOKUP: Record<string, string[]> = {
  home: ["home"],
  about: ["about"],
  services: ["services"],
  packages: ["packages"],
  clients: ["clients"],
  courses: ["courses", "dorat-hoy"],
  faq: ["faq"],
  blog: ["blog", "blogs", "almdonat"],
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

/**
 * Resolves CMS SEO title/description for a public page from `GET /v1/settings`.
 * Strips HTML from rich-text meta fields before they go into `<title>` / `<meta>`.
 */
export async function resolveSettingsPageSeo(
  pageKey: string,
): Promise<ResolvedSettingsSeo | null> {
  try {
    const { data } = await getSettings();
    const general = data.general as SettingsData["general"] & {
      home_meta_title?: string | null;
      home_meta_description?: string | null;
    };
    const row = findSeoRow(data.seo, pageKey);

    if (pageKey === "home") {
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
