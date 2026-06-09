import { localePath } from "@/features/blogs/lib/blog-routes";
import type { CountryRouteCode } from "@/features/shared/lib/country-routes";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import {
  buildHreflangLanguages,
  getAbsoluteUrl,
  localePathsForSlug,
  SITE_REFERRER_POLICY,
} from "@/lib/seo/metadata-helpers";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { SingleService } from "../types";
import { pickServiceSlug } from "./services-routes";

export async function buildServiceMetadata(
  service: SingleService,
  locale: Locale,
  countryCode: CountryRouteCode = "SA",
): Promise<Metadata> {
  const og = service.social?.open_graph;
  const tw = service.social?.twitter;

  const title = plainTextFromHtml(
    service.meta_title?.trim() || og?.title?.trim() || service.title || "",
  );
  const descriptionRaw =
    service.meta_description?.trim() ||
    og?.description?.trim() ||
    tw?.description?.trim() ||
    service.description;
  const description = plainTextFromHtml(descriptionRaw).slice(0, 160);

  const slug = pickServiceSlug(service, locale);
  const canonicalPath = localePath(
    locale,
    `/services/${encodeURIComponent(slug)}`,
    countryCode,
  );
  const canonical = await getAbsoluteUrl(canonicalPath);
  const localePaths = localePathsForSlug(
    "/services",
    service.slug_local,
    service.slug,
    countryCode,
  );
  const languages = await buildHreflangLanguages({
    logicalPath: `/services/${encodeURIComponent(slug)}`,
    localePaths,
    countryCode,
  });

  const image = og?.image || tw?.image || service.image;
  const images = image ? [{ url: image, alt: service.image_alt || title }] : undefined;

  return {
    title,
    description,
    referrer: SITE_REFERRER_POLICY,
    robots: { index: true, follow: true },
    alternates: { canonical, languages },
    openGraph: {
      title: og?.title ? plainTextFromHtml(og.title) || title : title,
      description: og?.description ? plainTextFromHtml(og.description).slice(0, 160) : description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: (og?.type as "website") || "website",
      url: canonical,
      siteName: og?.site_name,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: (tw?.card as "summary_large_image") || "summary_large_image",
      title: tw?.title ? plainTextFromHtml(tw.title) || title : title,
      description: tw?.description ? plainTextFromHtml(tw.description).slice(0, 160) : description,
      ...(images ? { images: [images[0].url] } : {}),
    },
  };
}
