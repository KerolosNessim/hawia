import AiServicesApiContentSection from "@/features/ai-services/components/ai-services-api-content-section";
import AiServiceDetailView from "@/features/ai-services/components/ai-service-detail-view";
import { countVisibleServicePageSections } from "@/features/services/lib/collect-page-sections";
import { sectionShellClassName, sectionToneAt } from "@/features/services/lib/section-tone";
import { buildAiServicesPageMetadata } from "@/features/services/lib/ai-service-metadata";
import { getAllServiceAisFull } from "@/features/services/services/get-service-ais";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { buildCanonicalUrl, serializeServicePageSchema } from "@/lib/seo/schema";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const services = await getAllServiceAisFull(locale);
  const primary = services[0];

  if (primary) {
    return buildAiServicesPageMetadata(primary, locale);
  }

  const t = await getTranslations("aiServicesPage");
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: true, follow: true },
  };
}

export default async function AiServicesPage() {
  const locale = (await getLocale()) as Locale;
  const tAi = await getTranslations("aiServicesPage");
  const tBreadcrumb = await getTranslations("seo.breadcrumb");
  const services = await getAllServiceAisFull(locale);

  if (!services.length) {
    return (
      <div className="pb-16">
        <p className="container py-24 text-center text-lg text-muted-foreground">{tAi("empty")}</p>
      </div>
    );
  }

  const primary = services[0];
  const apiTone = sectionToneAt(
    services.reduce(
      (offset, svc) => offset + countVisibleServicePageSections(svc, ["articleTags"]),
      0,
    ),
  );
  const pageUrl = buildCanonicalUrl(locale, "/ai-services");
  const schemaJson = serializeServicePageSchema({
    pageUrl,
    name: plainTextFromHtml(primary.meta_title || primary.singlePageTitle || primary.title).trim(),
    description: plainTextFromHtml(
      primary.meta_description || primary.description || primary.inside_desc || "",
    ).trim(),
    inLanguage: locale === "ar" ? "ar" : "en",
    areaServed: primary.countries,
    breadcrumbs: [
      { name: tBreadcrumb("home"), url: buildCanonicalUrl(locale, "/") },
      { name: tBreadcrumb("ai-services"), url: pageUrl },
    ],
  });

  return (
    <div className="pb-16">
      <PageSchemaScript json={schemaJson} />
      {services.map((service, index) => (
        <AiServiceDetailView
          key={service.id}
          service={service}
          showHero={index === 0}
          showHeaderAction={index === 0}
        />
      ))}
      <div className={sectionShellClassName(apiTone)}>
        <AiServicesApiContentSection embedded tone={apiTone} />
      </div>
    </div>
  );
}
