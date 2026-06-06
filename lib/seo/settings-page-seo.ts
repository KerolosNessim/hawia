import { resolveSettingsPageSeo } from "@/features/settings/lib/resolve-settings-seo";
import type { SettingSeo } from "@/features/settings/types";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { buildPageMetadata, type BuildPageMetadataInput } from "./metadata-helpers";

/** @deprecated Use `resolveSettingsPageSeo` */
export async function findSettingsSeo(pageKey: string): Promise<SettingSeo | null> {
  const resolved = await resolveSettingsPageSeo(pageKey);
  return resolved?.row ?? null;
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
  const cms = input.pageKey ? await resolveSettingsPageSeo(input.pageKey) : null;

  return buildPageMetadata({
    locale: input.locale,
    pathname: input.pathname,
    title: cms?.title || input.title,
    description: cms?.description || input.description || undefined,
    robots: input.robots,
    pagination: input.pagination,
  });
}
