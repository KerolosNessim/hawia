import JobOpeningDetailPage from "@/features/careers/components/job-opening-detail-page";
import { resolveJobOpeningBySlug } from "@/features/careers/api/jobsPublicApi";
import { jobOpeningPath, pickJobOpeningSlug } from "@/features/careers/lib/job-slug";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import { getPathname } from "@/i18n/navigation";
import {
  buildPageMetadata,
  localePathname,
  localePathsForSlug,
} from "@/lib/seo/metadata-helpers";
import { buildCanonicalUrl, serializeJobPostingSchema } from "@/lib/seo/schema";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

function jobMetaDescription(description: string): string {
  return plainTextFromHtml(description).trim().slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const decodedSlug = decodePathSegment(slug);
  const opening = await resolveJobOpeningBySlug(decodedSlug, locale);
  const pathname = localePathname(locale, jobOpeningPath(decodedSlug));

  if (!opening) {
    return buildPageMetadata({
      locale,
      pathname,
      title: locale.startsWith("ar") ? "الوظيفة غير موجودة" : "Job not found",
      robots: { index: false, follow: false },
    });
  }

  const canonicalSlug = pickJobOpeningSlug(opening, locale);
  const title = plainTextFromHtml(opening.title).trim() || (locale.startsWith("ar") ? "وظيفة" : "Job");
  const description =
    jobMetaDescription(opening.description) ||
    (locale.startsWith("ar")
      ? "تفاصيل الوظيفة الشاغرة في هوية."
      : "Job opening details at Howeyah.");
  const images = opening.media.image
    ? [{ url: opening.media.image, alt: opening.media.image_alt || title }]
    : undefined;

  return buildPageMetadata({
    locale,
    pathname: localePathname(locale, jobOpeningPath(canonicalSlug)),
    localePaths: localePathsForSlug("/careers", opening.slugLocal, canonicalSlug),
    title: `${title} | Howeyah`,
    description,
    openGraph: {
      title: `${title} | Howeyah`,
      description,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
      ...(images ? { images } : {}),
    },
  });
}

export default async function JobOpeningRoutePage({ params }: Props) {
  const { locale, slug } = await params;
  const decodedSlug = decodePathSegment(slug);
  const opening = await resolveJobOpeningBySlug(decodedSlug, locale);

  if (!opening) redirectToNotFound();

  const canonicalSlug = pickJobOpeningSlug(opening, locale);
  if (decodedSlug !== canonicalSlug) {
    permanentRedirect(
      getPathname({
        locale,
        href: {
          pathname: "/careers/[slug]",
          params: { slug: canonicalSlug },
        },
      }),
    );
  }

  const tSeo = await getTranslations({ locale, namespace: "seo.breadcrumb" });
  const title = plainTextFromHtml(opening.title).trim() || (locale.startsWith("ar") ? "وظيفة" : "Job");
  const pageUrl = buildCanonicalUrl(locale, jobOpeningPath(canonicalSlug));
  const careersUrl = buildCanonicalUrl(locale, "/careers");
  const jobSchemaJson = serializeJobPostingSchema({
    pageUrl,
    title,
    description: opening.description,
    employmentType: opening.job_type,
    inLanguage: locale.startsWith("ar") ? "ar" : "en",
    imageUrl: opening.media.image,
    breadcrumbs: [
      { name: tSeo("home"), url: buildCanonicalUrl(locale, "/") },
      { name: tSeo("careers"), url: careersUrl },
      { name: title, url: pageUrl },
    ],
  });

  return (
    <>
      <PageSchemaScript json={jobSchemaJson} />
      <JobOpeningDetailPage opening={opening} />
    </>
  );
}
