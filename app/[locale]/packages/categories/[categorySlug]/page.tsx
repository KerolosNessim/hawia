import PageHeader from "@/features/shared/components/page-header";
import { PublicPackageCardGrid } from "@/features/packages/components/public-package-cards";
import {
  fetchPublicPackagesByCategorySlug,
} from "@/features/packages/services/packages-public-api";
import { buildBreadcrumbJsonLd, buildPackageCollectionJsonLd, jsonLdScript } from "@/features/packages/lib/json-ld";
import { Link } from "@/i18n/navigation";
import {
  buildPageMetadata,
  getAbsoluteUrl,
  localePathname,
} from "@/lib/seo/metadata-helpers";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{ params: Promise<{ locale: string; categorySlug: string }> }>;

function categoryDescription(categoryTitle: string, packagesCount: number, locale: string) {
  if (locale.startsWith("ar")) {
    return packagesCount > 0
      ? `باقات ${categoryTitle} من هوية. قارن المميزات والأسعار واختر الباقة الأنسب لأهدافك.`
      : `باقات ${categoryTitle} من هوية.`;
  }
  return packagesCount > 0
    ? `${categoryTitle} packages and service bundles from Howeyah. Compare included features, pricing, and choose the best package for your goals.`
    : `${categoryTitle} packages and service bundles from Howeyah.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, categorySlug } = await params;
  const { category, packages } = await fetchPublicPackagesByCategorySlug(categorySlug, locale);

  if (!category) {
    return { title: "—", robots: { index: false, follow: false } };
  }

  const title =
    category.metaTitle?.trim() ||
    (locale.startsWith("ar") ? `${category.title} | الباقات` : `${category.title} | Packages`);
  const description =
    category.metaDescription?.trim() || categoryDescription(category.title, packages.length, locale).slice(0, 160);
  const loc = locale as Locale;

  return buildPageMetadata({
    locale: loc,
    pathname: localePathname(
      loc,
      `/packages/categories/${encodeURIComponent(category.slug)}`,
    ),
    title,
    description,
  });
}

export default async function PackageCategoryPage({ params }: Props) {
  const { locale, categorySlug } = await params;
  const t = await getTranslations("packagesPage");
  const detail = await getTranslations("packagesSection");
  const { category, packages } = await fetchPublicPackagesByCategorySlug(categorySlug, locale);

  if (!category) redirectToNotFound();

  const loc = locale as Locale;
  const packagesUrl = await getAbsoluteUrl(localePathname(loc, "/packages"));
  const categoryUrl = await getAbsoluteUrl(
    localePathname(loc, `/packages/categories/${encodeURIComponent(category.slug)}`),
  );
  const description =
    category.metaDescription?.trim() || categoryDescription(category.title, packages.length, locale);
  const packageBaseUrl = packagesUrl;

  const categoriesUrl = await getAbsoluteUrl(localePathname(loc, "/packages/categories"));
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t("breadcrumbHome"), url: await getAbsoluteUrl(localePathname(loc, "/")) },
    { name: t("breadcrumbPackages"), url: packagesUrl },
    { name: t("breadcrumbCategories"), url: categoriesUrl },
    { name: category.title, url: categoryUrl },
  ]);
  const collectionLd = buildPackageCollectionJsonLd({
    name: category.title,
    description,
    url: categoryUrl,
    packages,
    packageUrl: (pkg) =>
      `${packageBaseUrl}/${encodeURIComponent(pkg.slug)}`,
  });
  const structuredData = jsonLdScript([breadcrumbLd, ...collectionLd]);

  return (
    <div className="space-y-16 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <PageHeader title={category.title} description={description} image="/hero-bg.webp" />
      <div className="container mx-auto space-y-8 px-4">
        <Link
          href="/packages"
          className="inline-flex rounded-full border border-brand/30 px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
        >
          {t("allPackages")}
        </Link>
        <PublicPackageCardGrid
          items={packages}
          detailsFallback={detail("details")}
          emptyHint={detail("emptyCategory")}
        />
      </div>
    </div>
  );
}
