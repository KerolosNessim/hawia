import PageHeader from "@/features/shared/components/page-header";
import ClientCard from "@/features/clients/components/client-card";
import {
  fetchPublicClientsPageData,
} from "@/features/clients/services/clients-public-api";
import {
  buildBreadcrumbJsonLd,
  buildClientsCollectionJsonLd,
  jsonLdScript,
} from "@/features/clients/lib/json-ld";
import { getAbsoluteUrl, localePathname } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

function metaDescription(value: string, fallback: string): string {
  return (value.trim() || fallback).slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params;
  const loc = (await getLocale()) as Locale;
  const t = await getTranslations("clients");
  const pageData = await fetchPublicClientsPageData(loc);
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

export default async function ClientsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("clients");
  const pageData = await fetchPublicClientsPageData(locale);
  const title = pageData.title || t("title");
  const description = pageData.description || t("description");
  const loc = locale as Locale;
  const pageUrl = await getAbsoluteUrl(localePathname(loc, "/clients"));
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t("breadcrumbHome"), url: await getAbsoluteUrl(localePathname(loc, "/")) },
    { name: t("breadcrumbClients"), url: pageUrl },
  ]);
  const collectionLd = buildClientsCollectionJsonLd({
    name: title,
    description: metaDescription(description, t("metaDescription")),
    url: pageUrl,
    clients: pageData.clients,
    clientUrl: (client) => `${pageUrl}/${encodeURIComponent(client.slug)}`,
  });
  const structuredData = jsonLdScript([breadcrumbLd, ...collectionLd]);

  return (
    <div className="space-y-16 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <PageHeader title={title} description={description} image="/hero-bg.webp" />
      <div className="container mx-auto px-4">
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
            {t("empty")}
          </p>
        )}
      </div>
    </div>
  );
}
