import { getSettings } from "@/features/settings/services/settings-service";
import type { SettingSeo } from "@/features/settings/types";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { buildPageMetadata, type BuildPageMetadataInput } from "./metadata-helpers";

const PAGE_KEY_ALIASES: Record<string, string[]> = {
  contact: ["contact", "contact-us"],
  "contact-us": ["contact-us", "contact"],
};

export async function findSettingsSeo(pageKey: string): Promise<SettingSeo | null> {
  try {
    const { data } = await getSettings();
    const keys = PAGE_KEY_ALIASES[pageKey] ?? [pageKey];
    for (const key of keys) {
      const row = data.seo.find((s) => s.page_key === key);
      if (row) return row;
    }
  } catch {
    /* use fallbacks */
  }
  return null;
}

/** Static/listing pages: CMS SEO from settings + canonical + robots in `<head>`. */
export async function buildStaticPageMetadata(
  input: {
    locale: Locale;
    pathname: string;
    pageKey?: string;
    title: string;
    description?: string | null;
    robots?: Metadata["robots"];
  } & Pick<BuildPageMetadataInput, "pagination">,
): Promise<Metadata> {
  const cms = input.pageKey ? await findSettingsSeo(input.pageKey) : null;

  return buildPageMetadata({
    locale: input.locale,
    pathname: input.pathname,
    title: cms?.meta_title?.trim() || input.title,
    description: cms?.meta_description?.trim() || input.description,
    robots: input.robots,
    pagination: input.pagination,
  });
}
