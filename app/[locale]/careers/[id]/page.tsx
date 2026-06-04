import JobOpeningDetailPage from "@/features/careers/components/job-opening-detail-page";
import { resolveJobOpeningById } from "@/features/careers/api/jobsPublicApi";
import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import {
  buildPageMetadata,
  localePathname,
} from "@/lib/seo/metadata-helpers";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

function jobMetaDescription(description: string): string {
  return plainTextFromHtml(description).trim().slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const decodedId = decodePathSegment(id);
  const opening = await resolveJobOpeningById(decodedId, locale);
  const pathname = localePathname(locale, `/careers/${encodeURIComponent(decodedId)}`);

  if (!opening) {
    return buildPageMetadata({
      locale,
      pathname,
      title: locale.startsWith("ar") ? "الوظيفة غير موجودة" : "Job not found",
      robots: { index: false, follow: false },
    });
  }

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
    pathname: localePathname(locale, `/careers/${opening.id}`),
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
  const { locale, id } = await params;
  const opening = await resolveJobOpeningById(decodePathSegment(id), locale);

  if (!opening) redirectToNotFound();

  return <JobOpeningDetailPage opening={opening} />;
}
