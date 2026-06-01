import { ServicesCountryFilter } from "@/features/services/components/services-country-filter";
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
import {
  pickServiceSlug,
  servicePostHref,
  servicesIndexHref,
  servicesIndexPath,
} from "@/features/services/lib/services-routes";
import {
  parseCountryId,
  parsePage,
} from "@/features/services/lib/parse-services-search-params";
import {
  fetchPublicCountries,
  fetchPublicServicesPaginated,
} from "@/features/services/services/public-services-api";
import PageHeader from "@/features/shared/components/page-header";
import { absoluteUrlFromPath } from "@/lib/seo/schema";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

const SERVICES_LIST_PER_PAGE = 12;

type SearchParamsType = Record<string, string | string[] | undefined>;

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
  const countryId = parseCountryId(sp);

  const cookieStore = await cookies();
  const userCountryCode = cookieStore.get("user_country")?.value ?? "SA";
  const countries = await fetchPublicCountries();
  const defaultCountry = matchCountryByUserCode(countries, userCountryCode);
  const selectedCountryId = countryId ?? defaultCountry?.id;

  const { meta } = await fetchPublicServicesPaginated({
    paginationPath: localePath(locale, "/services"),
    locale,
    page,
    per_page: SERVICES_LIST_PER_PAGE,
    country_id: selectedCountryId,
  });

  return buildStaticPageMetadata({
    locale,
    pathname: servicesIndexHref(locale, page > 1 ? page : 1),
    pageKey: "services",
    title: t("metaTitle"),
    description: t("metaDescription"),
    pagination: {
      currentPage: meta.current_page,
      lastPage: meta.last_page,
      hrefForPage: (p) => servicesIndexHref(locale, p > 1 ? p : 1),
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

  const cookieStore = await cookies();
  const userCountryCode = cookieStore.get("user_country")?.value ?? "SA";

  const countries = await fetchPublicCountries();
  const countryIdParam = parseCountryId(sp);
  const defaultCountry = matchCountryByUserCode(countries, userCountryCode);
  const selectedCountryId = countryIdParam ?? defaultCountry?.id;

  const paginationPath = localePath(locale, "/services");

  const { services, meta } = await fetchPublicServicesPaginated({
    paginationPath,
    locale,
    page,
    per_page: SERVICES_LIST_PER_PAGE,
    country_id: selectedCountryId,
  });

  const listPath =
    servicesIndexHref(locale, page, { countryId: selectedCountryId }) ??
    localePath(locale, "/services");
  const listAbs = absoluteUrlFromPath(listPath);
  const indexAbs = buildCanonicalUrl(locale, "/services");

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
        ),
      })),
      listIdSuffix: "services",
    }),
    buildBreadcrumbList(
      [
        { name: t("breadcrumbHome"), url: buildCanonicalUrl(locale, "/") },
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
      />

      <div className="container space-y-10">
        <section className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">{sectionT("title")}</h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">{sectionT("subtitle")}</p>
        </section>

        {countries.length > 0 && selectedCountryId != null ? (
          <ServicesCountryFilter
            countries={countries}
            selectedCountryId={selectedCountryId}
            getCountryHref={(id) => servicesIndexPath(1, { countryId: id })}
          />
        ) : null}

        <section className="space-y-6">
          {services.length === 0 ? (
            <p className="py-16 text-center text-lg text-muted-foreground">{t("empty")}</p>
          ) : (
            <ServicesGrid services={services} countryId={selectedCountryId} />
          )}
        </section>

        {selectedCountryId != null ? (
          <ServicesListPagination
            meta={meta}
            countryId={selectedCountryId}
            previousLabel={t("paginationPrevious")}
            nextLabel={t("paginationNext")}
          />
        ) : null}
      </div>
    </div>
  );
}
