import PageHeader from "@/features/shared/components/page-header";
import PackagesPageBrowser from "@/features/packages/components/packages-page-browser";
import { fetchPackagesSectionData } from "@/features/packages/services/packages-public-api";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { localePathname } from "@/lib/seo/metadata-helpers";
import {
  buildBreadcrumbList,
  buildCollectionPageSchemaGraph,
  buildCanonicalUrl,
  jsonLdGraph,
} from "@/lib/seo/schema";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations("packagesPage");

  return buildStaticPageMetadata({
    locale: loc,
    pathname: localePathname(loc, "/packages"),
    pageKey: "packages",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function PackagesPage() {
  const locale = await getLocale();
  const t = await getTranslations("packagesPage");
  const detail = await getTranslations("packagesSection");
  const sectionData = await fetchPackagesSectionData(locale);

  const items = [
    ...sectionData.categories.flatMap(
      (category) => sectionData.packagesByCategoryId[category.id] ?? [],
    ),
    ...sectionData.uncategorized,
  ];
  const loc = locale as Locale;
  const pageUrl = buildCanonicalUrl(loc, "/packages");
  const packagesSchemaJson = jsonLdGraph([
    ...buildCollectionPageSchemaGraph({
      pageUrl,
      name: t("title"),
      description: t("metaDescription"),
      inLanguage: loc === "ar" ? "ar" : "en",
      breadcrumbs: [],
      items: items.map((pkg) => ({
        name: pkg.title,
        url: pkg.slug
          ? buildCanonicalUrl(loc, `/packages/${encodeURIComponent(pkg.slug)}`)
          : buildCanonicalUrl(loc, `/packages/${encodeURIComponent(String(pkg.id))}`),
      })),
      listIdSuffix: "packages",
    }),
    buildBreadcrumbList(
      [
        { name: t("breadcrumbHome"), url: buildCanonicalUrl(loc, "/") },
        { name: t("breadcrumbPackages"), url: pageUrl },
      ],
      pageUrl,
    ),
  ]);

  return (
    <div className="min-w-0 space-y-16 overflow-x-clip pb-16">
      <PageSchemaScript json={packagesSchemaJson} />
      <PageHeader
        title={t("title")}
        description={t("description")}
        image="/hero-bg.webp"
      />
      <div className="container mx-auto px-4">
        <PackagesPageBrowser
          categoriesHeading={t("categoriesHeading")}
          detailsFallback={detail("details")}
          emptyHint={t("empty")}
          emptyCategoryHint={detail("emptyCategory")}
          otherTabLabel={detail("otherTab")}
          sectionData={sectionData}
        />
      </div>
    </div>
  );
}
