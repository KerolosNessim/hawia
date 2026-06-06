import { resolveSettingsPageSeo } from "@/features/settings/lib/resolve-settings-seo";
import { getSettings } from "@/features/settings/services/settings-service";
import { buildGlobalSchemaGraph, jsonLdGraph } from "@/lib/seo/schema";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";

export default async function GlobalSchemaScript({ locale }: { locale: string }) {
  const loc = locale as Locale;
  const t = await getTranslations({ locale: loc, namespace: "seo" });

  let organizationDescription = t("organizationDescription");
  let websiteDescription = organizationDescription;

  try {
    const { data } = await getSettings();
    const homeSeo = await resolveSettingsPageSeo("home");
    organizationDescription =
      homeSeo?.description?.trim() ||
      data.general.site_description?.trim() ||
      organizationDescription;
    websiteDescription =
      data.general.site_description?.trim() || organizationDescription;

    const graph = buildGlobalSchemaGraph({
      settings: data,
      locale: loc,
      organizationDescription,
      websiteDescription,
    });

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(graph) }}
        suppressHydrationWarning
      />
    );
  } catch {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            buildGlobalSchemaGraph({
              settings: {
                general: {
                  site_name: "Howeyah",
                  site_description: organizationDescription,
                  logo: "/logo.webp",
                  favicon: "/favicon.ico",
                  timezone: "Africa/Cairo",
                  default_language: "ar",
                },
                contact: { email: "", phones: [] },
                offices: [],
                working_hours: {
                  from_day: "Sunday",
                  to_day: "Thursday",
                  from_hour: "09:00",
                  to_hour: "18:00",
                  show_on_site: false,
                },
                social_media: [],
                seo: [],
              },
              locale: loc,
              organizationDescription,
              websiteDescription,
            }),
          ),
        }}
        suppressHydrationWarning
      />
    );
  }
}
