import PageHeader from "@/features/shared/components/page-header";
import ClientCard from "@/features/clients/components/client-card";
import ClientsCategoryFilter from "@/features/clients/components/clients-category-filter";
import {
  countClientsByCategorySlug,
  fetchPublicClients,
  fetchPublicClientsPageData,
  fetchPublicSolutionCategories,
} from "@/features/clients/services/clients-public-api";
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
import { clientsIndexPath } from "@/features/clients/lib/clients-routes";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

type SearchParamsType = Record<string, string | string[] | undefined>;

function parseCategorySlug(sp: SearchParamsType): string | null {
  const raw =
    typeof sp.category === "string"
      ? sp.category
      : Array.isArray(sp.category)
        ? sp.category[0]
        : undefined;
  const slug = raw?.trim();
  return slug || null;
}

function metaDescription(value: string, fallback: string): string {
  return (value.trim() || fallback).slice(0, 160);
}

async function resolveCategorySlug(
  locale: string,
  sp: SearchParamsType,
): Promise<string | null> {
  const fromQuery = parseCategorySlug(sp);
  if (fromQuery) return fromQuery;
  const categories = await fetchPublicSolutionCategories(locale);
  return categories[0]?.slug ?? null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  await params;
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations("clients");
  const sp = searchParams ? await searchParams : {};
  const categorySlug = await resolveCategorySlug(loc, sp);
  const pageData = await fetchPublicClientsPageData(loc, { categorySlug: categorySlug ?? undefined });
  const title = pageData.title ? `${pageData.title} | Howeyah` : t("metaTitle");
  const description = metaDescription(pageData.description, t("metaDescription"));

  return buildStaticPageMetadata({
    locale: loc,
    pathname: localePathname(loc, "/clients"),
    pageKey: "clients",
    title,
    description,
  });
}

export default async function ClientsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = searchParams ? await searchParams : {};
  const categories = await fetchPublicSolutionCategories(locale);
  const parsedCategory = parseCategorySlug(sp);

  if (!parsedCategory && categories[0]?.slug) {
    redirect({
      href: clientsIndexPath({ categorySlug: categories[0].slug }),
      locale,
    });
  }

  const categorySlug = parsedCategory ?? categories[0]?.slug ?? null;
  const t = await getTranslations("clients");
  const [pageData, allClients] = await Promise.all([
    fetchPublicClientsPageData(locale, { categorySlug: categorySlug ?? undefined }),
    fetchPublicClients(locale),
  ]);
  const countByCategorySlug = countClientsByCategorySlug(allClients);
  const title = pageData.title || t("title");
  const description = pageData.description || t("description");
  const loc = locale as Locale;
  const pageUrl = buildCanonicalUrl(loc, "/clients");
  const clientsSchemaJson = jsonLdGraph([
    ...buildCollectionPageSchemaGraph({
      pageUrl,
      name: title,
      description: metaDescription(description, t("metaDescription")),
      inLanguage: loc === "ar" ? "ar" : "en",
      breadcrumbs: [],
      items: pageData.clients.map((client) => ({
        name: client.title,
        url: buildCanonicalUrl(loc, `/clients/${encodeURIComponent(client.slug)}`),
      })),
      listIdSuffix: "clients",
    }),
    buildBreadcrumbList(
      [
        { name: t("breadcrumbHome"), url: buildCanonicalUrl(loc, "/") },
        { name: t("breadcrumbClients"), url: pageUrl },
      ],
      pageUrl,
    ),
  ]);

  return (
    <div className="space-y-16 pb-16">
      <PageSchemaScript json={clientsSchemaJson} />
      <PageHeader title={title} description={description} image="/hero-bg.webp" />
      <div className="container mx-auto space-y-10 px-4">
        {categories.length > 0 && categorySlug ? (
          <ClientsCategoryFilter
            categories={categories}
            activeCategorySlug={categorySlug}
            countByCategorySlug={countByCategorySlug}
          />
        ) : null}

        {pageData.clients.length ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pageData.clients.map((client) => (
              <ClientCard
                key={client.id}
                slug={client.slug}
                title={client.title}
                description={client.descriptionPlain}
                image={client.imageUrl}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center text-muted-foreground">
            {t("emptyFiltered")}
          </p>
        )}
      </div>
    </div>
  );
}
