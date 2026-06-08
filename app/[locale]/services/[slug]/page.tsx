import DependenciesSection from "@/features/home/component/depndnces-sction";
import ServiceOurPartnersSection from "@/features/services/components/service-our-partners-section";
import ServicePageScript from "@/features/services/components/service-page-script";

import RelatedServicesSection from "@/features/services/components/related-services-section";
import ServiceApplicationSeoSection from "@/features/services/components/service-application-seo-section";
import { shouldShowApplicationSeoForm } from "@/features/services/services/application-seo-api";
import ServiceArticleTags, {
  resolveServiceArticleTags,
} from "@/features/services/components/service-article-tags";
import { ServicePageSections } from "@/features/services/components/service-page-sections";
import { parseCountryId } from "@/features/services/lib/parse-services-search-params";
import { resolveServiceCountryId } from "@/features/services/lib/resolve-service-country-id";
import { getServices } from "@/features/services/services/get-services";
import { fetchPublicCountriesPrepared } from "@/features/services/services/public-services-api";

import { buildServiceMetadata } from "@/features/services/lib/service-metadata";

import { pickServiceSlug, servicePostPath } from "@/features/services/lib/services-routes";

import {

  isGoneStatus,

  isPermanentRedirectStatus,

} from "@/features/services/lib/service-slug-redirect";

import { resolveServicePage } from "@/features/services/services/resolve-service-page";

export const dynamic = "force-dynamic";

import PageHeader from "@/features/shared/components/page-header";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";

import { RichHtml } from "@/features/shared/components/rich-html";

import { dedupeFaqItems } from "@/features/shared/lib/strip-leading-duplicate-heading";
import { buildCanonicalUrl, serializeServicePageSchema } from "@/lib/seo/schema";

import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";

import { plainTextFromHtml } from "@/lib/plain-text-from-html";

import { getPathname, redirect } from "@/i18n/navigation";

import * as motion from "framer-motion/client";

import type { Locale } from "next-intl";

import { getLocale, getTranslations } from "next-intl/server";

import type { Metadata } from "next";

import { resolveSupportedCountry } from "@/features/shared/lib/country-routes";
import { getServerCountryRouteCode } from "@/lib/get-country";
import { cookies } from "next/headers";

import { permanentRedirect, redirect as nextRedirect } from "next/navigation";

import type { ServicesSearchParams } from "@/features/services/lib/parse-services-search-params";



type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams?: Promise<ServicesSearchParams>;
};



export async function generateMetadata({ params }: Props): Promise<Metadata> {

  const { locale, slug } = await params;

  const resolved = await resolveServicePage(slug, locale);

  if (!resolved || resolved.kind === "gone") {
    return { title: "Service", robots: { index: false, follow: false } };
  }

  if (resolved.kind === "redirect") {
    return { title: "Service", robots: { index: false, follow: false } };
  }

  return buildServiceMetadata(resolved.data, locale);

}



function applySlugRedirect(
  locale: Locale,
  toSlug: string,
  status: number,
  countryCode: ReturnType<typeof resolveSupportedCountry>,
  toPath?: string,
): never {
  const href = servicePostPath(toSlug, { countryCode });

  const pathname = getPathname({ locale, href });

  if (isGoneStatus(status)) {

    redirectToNotFound(locale);

  }

  if (toPath) {
    if (isPermanentRedirectStatus(status)) {
      permanentRedirect(toPath);
    }
    nextRedirect(toPath);
  }

  if (isPermanentRedirectStatus(status)) {

    permanentRedirect(pathname);

  }

  redirect({ href, locale });

}



export default async function ServicePage({ params, searchParams }: Props) {

  const { slug, locale: routeLocale } = await params;
  const sp = searchParams ? await searchParams : {};

  const locale = (await getLocale()) as Locale;
  const countryCode = resolveSupportedCountry(
    (await cookies()).get("user_country")?.value ?? (await getServerCountryRouteCode()),
  );

  const t = await getTranslations("singleService");

  const resolved = await resolveServicePage(slug, locale);

  if (!resolved) redirectToNotFound(locale);

  if (resolved.kind === "gone") redirectToNotFound(locale);

  if (resolved.kind === "redirect") {
    applySlugRedirect(routeLocale, resolved.toSlug, resolved.status, countryCode, resolved.toPath);
  }



  const service = resolved.data;



  const serviceSlug = pickServiceSlug(service, locale);

  const serviceAbs = buildCanonicalUrl(
    locale,
    `/services/${encodeURIComponent(serviceSlug)}`,
    countryCode,
  );

  const heroTitle = service.singlePageTitle?.trim() || service.title;
  const heroSubtitle =
    service.subtitle?.trim() || service.description?.trim() || "";

  const tBreadcrumb = await getTranslations({ locale, namespace: "seo.breadcrumb" });

  const faqItems = dedupeFaqItems(
    service.pageSections
      .filter((section) => section.key === "faqs")
      .flatMap(
        (section) =>
          (section.data as { items?: { question: string; answer: string }[] }).items ?? [],
      ),
  );

  const serviceDescription = plainTextFromHtml(
    service.meta_description?.trim() ||
      service.description ||
      service.subtitle ||
      "",
  ).slice(0, 320);

  const serviceSchemaJson = serializeServicePageSchema({
    pageUrl: serviceAbs,
    name: plainTextFromHtml(heroTitle),
    description: serviceDescription,
    serviceType: plainTextFromHtml(service.meta_title || heroTitle),
    inLanguage: locale === "ar" ? "ar" : "en",
    areaServed: service.countries,
    breadcrumbs: [
      { name: tBreadcrumb("home"), url: buildCanonicalUrl(locale, "/", countryCode) },
      { name: tBreadcrumb("services"), url: buildCanonicalUrl(locale, "/services", countryCode) },
      { name: plainTextFromHtml(heroTitle), url: serviceAbs },
    ],
    faqItems: faqItems.length
      ? faqItems.map((item) => ({ question: item.question, answer: item.answer }))
      : undefined,
    faqName:
      faqItems.length > 0
        ? plainTextFromHtml(service.faqs?.title ?? "") || plainTextFromHtml(service.title)
        : undefined,
  });

  const cookieStore = await cookies();
  const userCountryCode = cookieStore.get("user_country")?.value ?? "SA";
  const preparedCountries = await fetchPublicCountriesPrepared();
  const relatedCountryId = resolveServiceCountryId({
    serviceCountries: service.countries ?? [],
    urlCountryId: parseCountryId(sp),
    allCountries: preparedCountries.countries,
    userCountryCode,
    idAlias: preparedCountries.idAlias,
  });

  const servicesListRes = await getServices(locale, { country_id: relatedCountryId });
  const relatedServices = (servicesListRes.data ?? []).filter((s) => s.id !== service.id);
  const articleTags = resolveServiceArticleTags(service);

  const applicationSeoVisible = await shouldShowApplicationSeoForm(
    service.id,
    locale,
    service.application_seo,
  );

  return (

    <div>

      {service.pageScript ? <ServicePageScript scriptHtml={service.pageScript} /> : null}

      <PageSchemaScript json={serviceSchemaJson} />

      <PageHeader
        titleHtml={heroTitle}
        descriptionHtml={heroSubtitle || undefined}
        image={service.image || "/whySeo.webp"}
        imageAlt={service.image_alt || ""}
      />

      {service.description?.trim() && service.pageSections.length === 0 ? (

        <div className="container py-12">

          <RichHtml html={service.description} className="cms-rich-html max-w-4xl mx-auto space-y-4" />

        </div>

      ) : null}

      {service.highlight_description ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="container py-10 text-center leading-loose"
        >
          <RichHtml
            html={service.highlight_description}
            className="cms-rich-html mx-auto max-w-4xl space-y-4 rounded-xl border border-brand/30 bg-brand/5 p-6"
          />
        </motion.div>
      ) : null}

      <ServicePageSections
        service={service}
        excludeKeys={["articleTags"]}
        insertAfterIndex={applicationSeoVisible ? 0 : undefined}
        insertion={
          applicationSeoVisible ? (
            <ServiceApplicationSeoSection
              serviceId={service.id}
              locale={locale}
              applicationSeo={service.application_seo}
              embedded
            />
          ) : undefined
        }
      />

      {service.ourAccreditations ? (
        <DependenciesSection accreditation={service.ourAccreditations} />
      ) : null}
      <ServiceOurPartnersSection partners={service.ourPartners} />
      {service.ourClients ? (
        <DependenciesSection accreditation={service.ourClients} />
      ) : null}

      <div className="space-y-16">
        <RelatedServicesSection services={relatedServices} countryId={relatedCountryId} />
      </div>

      {articleTags.length > 0 ? (
        <ServiceArticleTags
          tags={articleTags}
          heading={t("tagsHeading")}
          className="pb-16 pt-8"
        />
      ) : null}

    </div>

  );

}
