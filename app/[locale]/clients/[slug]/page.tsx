import { Button } from "@/components/ui/button";
import {
  buildBreadcrumbJsonLd,
  buildClientCreativeWorkJsonLd,
  jsonLdScript,
} from "@/features/clients/lib/json-ld";
import {
  fetchPublicClientDetail,
} from "@/features/clients/services/clients-public-api";
import PageHeader from "@/features/shared/components/page-header";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  buildPageMetadata,
  getAbsoluteUrl,
  localePathname,
} from "@/lib/seo/metadata-helpers";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import Image from "next/image";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import { RichHtml } from "@/features/shared/components/rich-html";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{ params: Promise<{ locale: string; slug: string }> }>;

function metaDescription(value: string, fallback: string): string {
  return (value.trim() || fallback).slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations("clients");
  const client = await fetchPublicClientDetail(slug, locale);

  if (!client) {
    return { title: t("not_found"), robots: { index: false, follow: false } };
  }

  const loc = locale as Locale;
  const title = client.metaTitle?.trim() || `${client.title} | Howeyah`;
  const description =
    client.metaDescription?.trim() ||
    metaDescription(client.descriptionPlain, t("metaDescription"));
  const images = client.imageUrl ? [{ url: client.imageUrl, alt: client.title }] : undefined;

  return buildPageMetadata({
    locale: loc,
    pathname: localePathname(loc, `/clients/${encodeURIComponent(client.slug)}`),
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "article",
      ...(images ? { images } : {}),
    },
  });
}

export default async function SingleClientPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("clients");
  const client = await fetchPublicClientDetail(slug, locale);

  if (!client) redirectToNotFound();

  const isRtl = locale.startsWith("ar");
  const loc = locale as Locale;
  const pageUrl = await getAbsoluteUrl(
    localePathname(loc, `/clients/${encodeURIComponent(client.slug)}`),
  );
  const clientsUrl = await getAbsoluteUrl(localePathname(loc, "/clients"));
  const description = client.metaDescription?.trim() || metaDescription(client.descriptionPlain, t("metaDescription"));
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t("breadcrumbHome"), url: await getAbsoluteUrl(localePathname(loc, "/")) },
    { name: t("breadcrumbClients"), url: clientsUrl },
    { name: client.title, url: pageUrl },
  ]);
  const clientLd = buildClientCreativeWorkJsonLd({
    client,
    url: pageUrl,
    description,
    inLanguage: isRtl ? "ar" : "en",
  });
  const structuredData = jsonLdScript([breadcrumbLd, clientLd]);

  return (
    <div className="space-y-16 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <PageHeader title={client.title} description={client.descriptionPlain} image={client.imageUrl || "/hero-bg.webp"} />

      <div className="container mx-auto space-y-10 px-4">
        <Button variant="ghost" asChild className="rounded-full gap-2">
          <Link href="/clients">
            {isRtl ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
            {t("back")}
          </Link>
        </Button>

        <article className="overflow-hidden rounded-[2rem] border border-border/60 bg-white shadow-sm">
          <div className="relative aspect-video w-full bg-gray-100">
            <Image
              src={client.imageUrl || "/hero-bg.webp"}
              alt={client.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-cover"
            />
          </div>
          <div className="space-y-6 p-6 md:p-10">
            <h1 className="text-3xl font-black text-gray-900 md:text-5xl">{client.title}</h1>
            {client.descriptionHtml ? (
              <RichHtml
                html={client.descriptionHtml}
                className="max-w-none text-lg leading-9 text-muted-foreground [&_h1]:text-3xl [&_h1]:font-black [&_h2]:text-2xl [&_h2]:font-black [&_h3]:text-xl [&_h3]:font-bold"
              />
            ) : null}
          </div>
        </article>

        {client.imageUrls.length > 1 ? (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {client.imageUrls.slice(1).map((image, index) => (
              <div key={image} className="relative aspect-video overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
                <Image
                  src={image}
                  alt={`${client.title} ${index + 2}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  className="object-cover"
                />
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
