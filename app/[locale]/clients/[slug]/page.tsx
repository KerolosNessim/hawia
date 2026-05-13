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
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

type Props = Readonly<{ params: Promise<{ locale: string; slug: string }> }>;

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
  const { locale, slug } = await params;
  const t = await getTranslations("clients");
  const client = await fetchPublicClientDetail(slug, locale);

  if (!client) {
    return { title: t("not_found"), robots: { index: false, follow: false } };
  }

  const title = client.metaTitle?.trim() || `${client.title} | Howeyah`;
  const description = client.metaDescription?.trim() || metaDescription(client.descriptionPlain, t("metaDescription"));
  const canonical =
    (await absolutePath(`/${locale}/clients/${encodeURIComponent(client.slug)}`)) ?? undefined;
  const images = client.imageUrl ? [{ url: client.imageUrl, alt: client.title }] : undefined;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "article",
      ...(images ? { images } : {}),
    },
  };
}

export default async function SingleClientPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("clients");
  const client = await fetchPublicClientDetail(slug, locale);

  if (!client) notFound();

  const isRtl = locale.startsWith("ar");
  const pageUrl =
    (await absolutePath(`/${locale}/clients/${encodeURIComponent(client.slug)}`)) ??
    `/${locale}/clients/${encodeURIComponent(client.slug)}`;
  const clientsUrl = (await absolutePath(`/${locale}/clients`)) ?? `/${locale}/clients`;
  const description = client.metaDescription?.trim() || metaDescription(client.descriptionPlain, t("metaDescription"));
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t("breadcrumbHome"), url: (await absolutePath(`/${locale}`)) ?? `/${locale}` },
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
              className="object-cover"
            />
          </div>
          <div className="space-y-6 p-6 md:p-10">
            <h1 className="text-3xl font-black text-gray-900 md:text-5xl">{client.title}</h1>
            {client.descriptionHtml ? (
              <div
                className="max-w-none text-lg leading-9 text-muted-foreground [&_a]:text-brand [&_a]:underline [&_h1]:text-3xl [&_h1]:font-black [&_h2]:text-2xl [&_h2]:font-black [&_h3]:text-xl [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-6 [&_p]:mb-4 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-6"
                dangerouslySetInnerHTML={{ __html: client.descriptionHtml }}
              />
            ) : null}
          </div>
        </article>

        {client.imageUrls.length > 1 ? (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {client.imageUrls.slice(1).map((image, index) => (
              <div key={image} className="relative aspect-video overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
                <Image src={image} alt={`${client.title} ${index + 2}`} fill className="object-cover" />
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
