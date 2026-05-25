import SingleCoursePage from "@/features/courses/components/single-course-page";
import { resolvePublicCourse } from "@/features/courses/services/courses-public-api";
import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import {
  buildPageMetadata,
  localePathname,
  localePathsForSlug,
} from "@/lib/seo/metadata-helpers";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const course = await resolvePublicCourse(decodePathSegment(id), locale);

  if (!course) {
    return buildPageMetadata({
      locale,
      pathname: localePathname(locale, `/courses/${encodeURIComponent(id)}`),
      title: "Course",
      robots: { index: false, follow: false },
    });
  }

  const slug = course.slug || course.id;
  const description = plainTextFromHtml(
    course.metaDescription || course.description,
  ).slice(0, 160);

  return buildPageMetadata({
    locale,
    pathname: localePathname(locale, `/courses/${encodeURIComponent(slug)}`),
    localePaths: localePathsForSlug("/courses", course.slugLocal, slug),
    title: course.metaTitle?.trim() || course.title,
    description: description || undefined,
  });
}

export default async function Page({
  params,
}: Props) {
  const { locale, id } = await params;
  const course = await resolvePublicCourse(decodePathSegment(id), locale);
  if (!course) redirectToNotFound();
  return <SingleCoursePage course={course} />;
}
