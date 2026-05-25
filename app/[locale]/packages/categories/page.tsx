import { PublicPackageCardGrid } from "@/features/packages/components/public-package-cards";

import {

  fetchPackagesSectionData,

  fetchPublicPackageCategories,

} from "@/features/packages/services/packages-public-api";

import { buildBreadcrumbJsonLd, jsonLdScript } from "@/features/packages/lib/json-ld";

import PageHeader from "@/features/shared/components/page-header";

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

    pathname: localePathname(loc, "/packages/categories"),

    pageKey: "packages-categories",

    title: t("categoriesIndexMetaTitle"),

    description: t("categoriesIndexMetaDescription"),

  });

}



export default async function PackageCategoriesIndexPage() {

  const locale = await getLocale();

  const t = await getTranslations("packagesPage");

  const detail = await getTranslations("packagesSection");

  const [categories, sectionData] = await Promise.all([

    fetchPublicPackageCategories(locale),

    fetchPackagesSectionData(locale),

  ]);



  const totalPackages =

    sectionData.categories.reduce(

      (n, c) => n + (sectionData.packagesByCategoryId[c.id]?.length ?? 0),

      0,

    ) + sectionData.uncategorized.length;



  const loc = locale as Locale;

  const pageUrl = await getAbsoluteUrl(localePathname(loc, "/packages/categories"));

  const packagesUrl = await getAbsoluteUrl(localePathname(loc, "/packages"));



  const breadcrumbLd = buildBreadcrumbJsonLd([

    {

      name: t("breadcrumbHome"),

      url: await getAbsoluteUrl(localePathname(loc, "/")),

    },

    { name: t("breadcrumbPackages"), url: packagesUrl },

    { name: t("breadcrumbCategories"), url: pageUrl },

  ]);

  const structuredData = jsonLdScript([breadcrumbLd]);



  return (

    <div className="min-w-0 space-y-16 overflow-x-clip pb-16">

      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: structuredData }}

      />

      <PageHeader

        title={t("categoriesIndexTitle")}

        description={t("categoriesIndexDescription")}

        image="/hero-bg.webp"

      />

      <div className="container mx-auto space-y-12 px-4">

        <Link

          href="/packages"

          className="inline-flex rounded-full border border-brand/30 px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"

        >

          {t("allPackages")}

        </Link>



        {categories.length ? (

          <div className="flex flex-wrap gap-3">

            {categories.map((category) => (

              <Link

                key={category.id}

                href={`/packages/categories/${encodeURIComponent(category.slug)}`}

                className="rounded-full border border-brand/30 bg-brand/5 px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"

              >

                {category.title}

                {(sectionData.packagesByCategoryId[category.id]?.length ?? 0) > 0 ? (

                  <span className="ms-1.5 rounded-md bg-brand/15 px-1.5 py-px text-[11px] tabular-nums">

                    {sectionData.packagesByCategoryId[category.id].length}

                  </span>

                ) : null}

              </Link>

            ))}

          </div>

        ) : (

          <p className="text-muted-foreground">{t("emptyCategories")}</p>

        )}



        {totalPackages === 0 ? (

          <p className="text-center text-muted-foreground py-8">{t("empty")}</p>

        ) : (

          <div className="space-y-14">

            {sectionData.categories.map((category) => {

              const items = sectionData.packagesByCategoryId[category.id] ?? [];

              if (!items.length) return null;

              return (

                <section key={category.id} className="space-y-6">

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <h2 className="text-2xl font-bold text-foreground">{category.title}</h2>

                    <Link

                      href={`/packages/categories/${encodeURIComponent(category.slug)}`}

                      className="text-sm font-semibold text-brand hover:underline"

                    >

                      {t("viewCategory")}

                    </Link>

                  </div>

                  <PublicPackageCardGrid

                    items={items}

                    detailsFallback={detail("details")}

                    emptyHint={detail("emptyCategory")}

                  />

                </section>

              );

            })}

            {sectionData.uncategorized.length > 0 ? (

              <section className="space-y-6">

                <h2 className="text-2xl font-bold text-foreground">{detail("otherTab")}</h2>

                <PublicPackageCardGrid

                  items={sectionData.uncategorized}

                  detailsFallback={detail("details")}

                  emptyHint={t("empty")}

                />

              </section>

            ) : null}

          </div>

        )}

      </div>

    </div>

  );

}


