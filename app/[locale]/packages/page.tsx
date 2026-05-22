import PageHeader from "@/features/shared/components/page-header";
import { PublicPackageCardGrid } from "@/features/packages/components/public-package-cards";
import { fetchPackagesSectionData } from "@/features/packages/services/packages-public-api";
import {
  buildBreadcrumbJsonLd,
  buildPackageCollectionJsonLd,
  jsonLdScript,
} from "@/features/packages/lib/json-ld";
import { Link } from "@/i18n/navigation";
import { getAbsoluteUrl, localePathname } from "@/lib/seo/metadata-helpers";
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
  const pageUrl = await getAbsoluteUrl(localePathname(loc, "/packages"));
  const breadcrumbLd = buildBreadcrumbJsonLd([
    {
      name: t("breadcrumbHome"),
      url: await getAbsoluteUrl(localePathname(loc, "/")),
    },
    { name: t("breadcrumbPackages"), url: pageUrl },
  ]);
  const collectionLd = buildPackageCollectionJsonLd({
    name: t("title"),
    description: t("metaDescription"),
    url: pageUrl,
    packages: items,
    packageUrl: (pkg) =>
      pkg.slug
        ? `${pageUrl}/${encodeURIComponent(pkg.slug)}`
        : `${pageUrl}/${encodeURIComponent(pkg.id)}`,
  });
  const structuredData = jsonLdScript([breadcrumbLd, ...collectionLd]);

  return (
    <div className="space-y-16 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <PageHeader
        title={t("title")}
        description={t("description")}
        image="/hero-bg.webp"
      />
      <div className="container mx-auto space-y-10 px-4">
        {sectionData.categories.length ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              {t("categoriesHeading")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {sectionData.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/packages/categories/${encodeURIComponent(category.slug)}`}
                  className="rounded-full border border-brand/30 bg-brand/5 px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <PublicPackageCardGrid
          items={items}
          detailsFallback={detail("details")}
          emptyHint={t("empty")}
        />
      </div>
    </div>
  );
}
