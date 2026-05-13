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
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

async function absolutePath(path: string): Promise<string | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (path.startsWith("http")) return path;
  return `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;
}

function metaDescription(value: string, fallback: string): string {
  return (value.trim() || fallback).slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("clients");
  const pageData = await fetchPublicClientsPageData(locale);
  const title = pageData.title ? `${pageData.title} | Howeyah` : t("metaTitle");
  const description = metaDescription(pageData.description, t("metaDescription"));
  const canonical = (await absolutePath(`/${locale}/clients`)) ?? undefined;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
  };
}

export default async function ClientsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("clients");
  const pageData = await fetchPublicClientsPageData(locale);
  const title = pageData.title || t("title");
  const description = pageData.description || t("description");
  const pageUrl = (await absolutePath(`/${locale}/clients`)) ?? `/${locale}/clients`;
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t("breadcrumbHome"), url: (await absolutePath(`/${locale}`)) ?? `/${locale}` },
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
