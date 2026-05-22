import { ServicesCountryFilter } from "@/features/services/components/services-country-filter";
import { ServicesGrid } from "@/features/services/components/services-grid";
import { ServicesListPagination } from "@/features/services/components/services-list-pagination";
import { matchCountryByUserCode } from "@/features/services/lib/country-match";
import {
  buildBreadcrumbJsonLd,
  buildServiceCollectionJsonLd,
  jsonLdScript,
} from "@/features/services/lib/services-json-ld";
import { localePath } from "@/features/blogs/lib/blog-routes";
import {
  servicePostHref,
  servicesIndexHref,
  servicesIndexPath,
} from "@/features/services/lib/services-routes";
import {
  fetchPublicCountries,
  fetchPublicServicesPaginated,
} from "@/features/services/services/public-services-api";
import PageHeader from "@/features/shared/components/page-header";
import { getAbsoluteUrl } from "@/lib/seo/metadata-helpers";
import { getSiteUrl } from "@/lib/seo/site-url";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

const SERVICES_LIST_PER_PAGE = 12;

type SearchParamsType = Record<string, string | string[] | undefined>;

function parsePage(sp: SearchParamsType): number {
  const raw =
    typeof sp.page === "string" ? sp.page : Array.isArray(sp.page) ? sp.page[0] : "1";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function parseCountryId(sp: SearchParamsType): number | undefined {
  const raw =
    typeof sp.country_id === "string"
      ? sp.country_id
      : Array.isArray(sp.country_id)
        ? sp.country_id[0]
        : undefined;
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
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
  const countryId = parseCountryId(sp);

  const cookieStore = await cookies();
  const userCountryCode = cookieStore.get("user_country")?.value ?? "EG";
  const countries = await fetchPublicCountries();
  const defaultCountry = matchCountryByUserCode(countries, userCountryCode);
  const selectedCountryId = countryId ?? defaultCountry?.id;

  const { meta } = await fetchPublicServicesPaginated({
    paginationPath: localePath(locale, "/services"),
    page,
    per_page: SERVICES_LIST_PER_PAGE,
    country_id: selectedCountryId,
  });

  return buildStaticPageMetadata({
    locale,
    pathname: servicesIndexHref(locale, page > 1 ? page : 1, { countryId: selectedCountryId }),
    pageKey: "services",
    title: t("metaTitle"),
    description: t("metaDescription"),
    pagination: {
      currentPage: meta.current_page,
      lastPage: meta.last_page,
      hrefForPage: (p) =>
        servicesIndexHref(locale, p > 1 ? p : 1, { countryId: selectedCountryId }),
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
  const userCountryCode = cookieStore.get("user_country")?.value ?? "EG";

  const countries = await fetchPublicCountries();
  const countryIdParam = parseCountryId(sp);
  const defaultCountry = matchCountryByUserCode(countries, userCountryCode);
  const selectedCountryId = countryIdParam ?? defaultCountry?.id;

  const paginationPath = localePath(locale, "/services");

  const { services, meta } = await fetchPublicServicesPaginated({
    paginationPath,
    page,
    per_page: SERVICES_LIST_PER_PAGE,
    country_id: selectedCountryId,
  });

  const listPath =
    servicesIndexHref(locale, page, { countryId: selectedCountryId }) ??
    localePath(locale, "/services");
  const listAbs = await getAbsoluteUrl(listPath);
  const indexAbs = await getAbsoluteUrl(localePath(locale, "/services"));

  const breadcrumbLd = buildBreadcrumbJsonLd([
    {
      name: t("breadcrumbHome"),
      url: await getAbsoluteUrl(localePath(locale, "/")),
    },
    { name: t("breadcrumbServices"), url: indexAbs },
  ]);

  const siteUrl = getSiteUrl();

  const collectionLd = buildServiceCollectionJsonLd({
    name: t("title"),
    description: t("metaDescription"),
    url: listAbs,
    services,
    serviceUrl: (service) =>
      `${siteUrl}${servicePostHref(locale, service.slug)}`,
  });

  const structuredData = jsonLdScript([breadcrumbLd, ...collectionLd]);

  return (
    <div className="space-y-12 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

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
            <ServicesGrid services={services} />
          )}
        </section>

        {selectedCountryId != null ? (
          <ServicesListPagination
            meta={meta}
            countryId={selectedCountryId}
            previousLabel={t("paginationPrevious")}
            nextLabel={t("paginationNext")}
            isRtl={locale === "ar"}
          />
        ) : null}
      </div>
    </div>
  );
}
