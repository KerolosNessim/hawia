import { ServicesGrid } from "@/features/services/components/services-grid";
import { ServicesListPagination } from "@/features/services/components/services-list-pagination";
import { matchCountryByUserCode } from "@/features/services/lib/country-match";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import {
  buildBreadcrumbList,
  buildCollectionPageSchemaGraph,
  buildCanonicalUrl,
  jsonLdGraph,
} from "@/lib/seo/schema";
import { localePath } from "@/features/blogs/lib/blog-routes";
import { pickServiceSlug, servicesIndexHref } from "@/features/services/lib/services-routes";
import { getServerCountry, getServerCountryRouteCode } from "@/lib/get-country";
import { parsePage } from "@/features/services/lib/parse-services-search-params";
import {
  fetchPublicCountriesPrepared,
  fetchPublicServicesPaginated,
} from "@/features/services/services/public-services-api";
import PageHeader from "@/features/shared/components/page-header";
import { absoluteUrlFromPath } from "@/lib/seo/schema";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

const SERVICES_LIST_PER_PAGE = 12;

type SearchParamsType = Record<string, string | string[] | undefined>;

async function resolveCountryIdFromIp() {
  const geoCountry = await getServerCountry();
  const preparedCountries = await fetchPublicCountriesPrepared();
  const country = matchCountryByUserCode(preparedCountries.countries, geoCountry);
  return country?.id;
}

export async function generateMetadata({
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<SearchParamsType>;
}): Promise<Metadata> {
  const t = await getTranslations("servicesPage");
  const locale = (await getLocale()) as Locale;
  const sp = searchParams ? await searchParams : {};
  const page = parsePage(sp);
  const countryCode = await getServerCountryRouteCode();
  const countryId = await resolveCountryIdFromIp();

  const { meta } = await fetchPublicServicesPaginated({
    paginationPath: localePath(locale, "/services", countryCode),
    locale,
    page,
    per_page: SERVICES_LIST_PER_PAGE,
    country_id: countryId,
  });

  return buildStaticPageMetadata({
    locale,
    pathname: servicesIndexHref(locale, page > 1 ? page : 1, { countryCode }),
    pageKey: "services",
    title: t("metaTitle"),
    description: t("metaDescription"),
    pagination: {
      currentPage: meta.current_page,
      lastPage: meta.last_page,
      hrefForPage: (p) =>
        servicesIndexHref(locale, p > 1 ? p : 1, { countryCode }),
    },
  });
}

export default async function ServicesPage(props: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<SearchParamsType>;
}) {
  await props.params;
  const t = await getTranslations("servicesPage");
  const sectionT = await getTranslations("servicesSection");
  const sp = props.searchParams ? await props.searchParams : {};
  const page = parsePage(sp);
  const locale = (await getLocale()) as Locale;
  const countryCode = await getServerCountryRouteCode();
  const countryId = await resolveCountryIdFromIp();

  const paginationPath = localePath(locale, "/services", countryCode);

  const { services, meta } = await fetchPublicServicesPaginated({
    paginationPath,
    locale,
    page,
    per_page: SERVICES_LIST_PER_PAGE,
    country_id: countryId,
  });

  const listPath =
    servicesIndexHref(locale, page, { countryCode }) ?? localePath(locale, "/services", countryCode);
  const listAbs = absoluteUrlFromPath(listPath);
  const indexAbs = buildCanonicalUrl(locale, "/services", countryCode);

  const servicesSchemaJson = jsonLdGraph([
    ...buildCollectionPageSchemaGraph({
      pageUrl: listAbs,
      name: t("title"),
      description: t("metaDescription"),
      inLanguage: locale === "ar" ? "ar" : "en",
      breadcrumbs: [],
      items: services.map((service) => ({
        name: service.title.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        url: buildCanonicalUrl(
          locale,
          `/services/${encodeURIComponent(pickServiceSlug(service, locale))}`,
          countryCode,
        ),
      })),
      listIdSuffix: "services",
    }),
    buildBreadcrumbList(
      [
        { name: t("breadcrumbHome"), url: buildCanonicalUrl(locale, "/", countryCode) },
        { name: t("breadcrumbServices"), url: indexAbs },
      ],
      listAbs,
    ),
  ]);

  return (
    <div className="space-y-12 pb-16">
      <PageSchemaScript json={servicesSchemaJson} />

      <PageHeader
        title={t("title")}
        description={t("description")}
        image="/hero-bg.webp"
        showHeadingDivider
        align="center"
      />

      <div className="container space-y-10">
        <section className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">{sectionT("title")}</h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">{sectionT("subtitle")}</p>
        </section>

        <section className="space-y-6">
          {services.length === 0 ? (
            <p className="py-16 text-center text-lg text-muted-foreground">{t("empty")}</p>
          ) : (
            <ServicesGrid titleDark={true} services={services} countryCode={countryCode} />
          )}
        </section>

        <ServicesListPagination
          meta={meta}
          countryCode={countryCode}
          previousLabel={t("paginationPrevious")}
          nextLabel={t("paginationNext")}
        />
      </div>
    </div>
  );
}
