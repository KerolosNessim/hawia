import { fetchPublicPackageDetail } from "@/features/packages/services/packages-public-api";
import { PackageImage } from "@/features/packages/components/public-package-cards";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import {
  buildPageMetadata,
  getAbsoluteUrl,
  localePathname,
} from "@/lib/seo/metadata-helpers";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import {
  buildBreadcrumbJsonLd,
  buildPackageProductJsonLd,
  jsonLdScript,
} from "@/features/packages/lib/json-ld";
import {
  DEFAULT_INLINE_IMG_HEIGHT,
  DEFAULT_INLINE_IMG_WIDTH,
} from "@/lib/inline-image-alt";
import { RichHtml } from "@/features/shared/components/rich-html";
import { SiteBreadcrumbBar } from "@/features/shared/components/site-breadcrumb";

type Props = Readonly<{ params: Promise<{ locale: string; slug: string }> }>;

function packageDescription(pkg: { description: string; title: string }) {
  const text = pkg.description?.trim() || pkg.title;
  return text.slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const decoded = decodeURIComponent(slug);
  const pkg = await fetchPublicPackageDetail(decoded, locale);
  const t = await getTranslations("packageDetail");
  const loc = locale as Locale;

  if (!pkg) {
    return { title: t("notFound"), robots: { index: false, follow: false } };
  }

  const title = pkg.metaTitle?.trim() || pkg.title;
  const description = pkg.metaDescription?.trim() || packageDescription(pkg);
  const pathname = localePathname(loc, `/packages/${encodeURIComponent(pkg.slug)}`);
  const images = pkg.imageUrl
    ? [{ url: pkg.imageUrl, alt: pkg.title }]
    : undefined;

  const metadata = await buildPageMetadata({
    locale: loc,
    pathname,
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
      ...(images ? { images } : {}),
    },
  });

  const customCanonical = pkg.canonicalUrl?.trim();
  if (customCanonical) {
    return {
      ...metadata,
      keywords: pkg.metaKeywords?.trim() || undefined,
      alternates: { ...metadata.alternates, canonical: customCanonical },
    };
  }

  return {
    ...metadata,
    keywords: pkg.metaKeywords?.trim() || undefined,
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug, locale: routeLocale } = await params;
  const locale = await getLocale();
  const t = await getTranslations("packageDetail");
  const packagesT = await getTranslations("packagesPage");
  const decoded = decodeURIComponent(slug);

  const pkg = await fetchPublicPackageDetail(decoded, locale);
  if (!pkg) redirectToNotFound();

  const priceUi =
    pkg.price != null && String(pkg.price).trim() !== ""
      ? pkg.currency?.trim()
        ? `${pkg.currency.trim()} ${pkg.price}`
        : String(pkg.price)
      : pkg.priceLabel;
  const routeLoc = routeLocale as Locale;
  const pageUrl =
    pkg.canonicalUrl?.trim() ||
    (await getAbsoluteUrl(
      localePathname(routeLoc, `/packages/${encodeURIComponent(pkg.slug)}`),
    ));
  const packagesUrl = await getAbsoluteUrl(localePathname(routeLoc, "/packages"));
  const breadcrumbItems = [
    {
      name: packagesT("breadcrumbHome"),
      url: await getAbsoluteUrl(localePathname(routeLoc, "/")),
    },
    { name: packagesT("breadcrumbPackages"), url: packagesUrl },
  ];
  if (pkg.category?.slug) {
    breadcrumbItems.push({
      name: pkg.category.title,
      url: await getAbsoluteUrl(
        localePathname(
          routeLoc,
          `/packages/categories/${encodeURIComponent(pkg.category.slug)}`,
        ),
      ),
    });
  }
  breadcrumbItems.push({ name: pkg.title, url: pageUrl });
  const breadcrumbLd = buildBreadcrumbJsonLd(breadcrumbItems);
  const productLd = buildPackageProductJsonLd({
    pkg,
    url: pageUrl,
    description: pkg.metaDescription?.trim() || packageDescription(pkg),
    inLanguage: routeLocale === "ar" ? "ar" : "en",
  });
  const structuredData = jsonLdScript([breadcrumbLd, productLd]);

  return (
    <>
      <SiteBreadcrumbBar />
      <div className="container mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <Button variant="ghost" asChild className="mb-8 rounded-full gap-2">
        <Link href="/packages">
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
      </Button>

      <div className="rounded-3xl border border-border/60 bg-white p-8 md:p-12 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-8 md:items-start">
          {pkg.imageUrl ? (
            <div className="mx-auto md:mx-0 shrink-0 w-full max-w-sm">
              <img
                src={pkg.imageUrl}
                alt={pkg.imageAlt || pkg.title}
                width={DEFAULT_INLINE_IMG_WIDTH}
                height={DEFAULT_INLINE_IMG_HEIGHT}
                loading="lazy"
                decoding="async"
                className="h-auto max-h-64 w-full rounded-2xl border border-gray-100 bg-gray-50 object-contain p-3"
              />
            </div>
          ) : (
            <div className="mx-auto md:mx-0 shrink-0 flex h-[96px] w-[96px] items-center justify-center rounded-full border border-gray-100 bg-gray-50 p-5">
              <PackageImage pkg={pkg} className="h-14 w-14 text-brand" />
            </div>
          )}
          <div className="flex-1 text-center md:text-start space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{pkg.title}</h1>
            {priceUi ? (
              <p className="text-lg font-semibold text-brand">{priceUi}</p>
            ) : null}
            <RichHtml
              html={pkg.description}
              className="text-muted-foreground leading-relaxed"
            />
            {/* <DetailsButton pkg={pkg} fallbackLabel={t("order")} /> */}
          </div>
        </div>

        {pkg.features.length > 0 ? (
          <div className="border-t pt-8">
            <h2 className="text-xl font-bold mb-6">{t("features")}</h2>
            <ul className="space-y-3">
              {pkg.features.map((f, i) => (
                <li key={i} className="flex gap-3 text-sm md:text-base">
                  <span
                    className={
                      f.isIncluded
                        ? "text-emerald-600 font-bold shrink-0"
                        : "text-gray-400 shrink-0"
                    }
                    aria-hidden
                  >
                    {f.isIncluded ? "✓" : "✕"}
                  </span>
                  <span
                    className={
                      f.isIncluded
                        ? "text-gray-900"
                        : "text-gray-400 line-through"
                    }
                  >
                    {f.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      </div>
    </>
  );
}
