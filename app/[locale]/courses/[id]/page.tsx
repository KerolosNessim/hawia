import SingleCoursePage from "@/features/courses/components/single-course-page";
import { resolvePublicCourse } from "@/features/courses/services/courses-public-api";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import {
  buildPageMetadata,
  localePathname,
  localePathsForSlug,
} from "@/lib/seo/metadata-helpers";
import { buildCanonicalUrl, schemaMediaUrl, serializeCoursePageSchema } from "@/lib/seo/schema";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
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

  const tSeo = await getTranslations({ locale, namespace: "seo.breadcrumb" });
  const slug = course.slug || course.id;
  const pageUrl = buildCanonicalUrl(locale, `/courses/${encodeURIComponent(slug)}`);
  const coursesIndexUrl = buildCanonicalUrl(locale, "/courses");
  const title = plainTextFromHtml(course.metaTitle?.trim() || course.title) || course.title;
  const description = plainTextFromHtml(
    course.metaDescription?.trim() || course.description,
  ).slice(0, 320);

  const courseSchemaJson = serializeCoursePageSchema({
    pageUrl,
    name: title,
    description: description || title,
    inLanguage: locale === "ar" ? "ar" : "en",
    imageUrl: schemaMediaUrl(course.imageSrc),
    priceLabel: course.priceLabel,
    lessonCount: course.lessons.length,
    lessons: course.lessons.map((lesson, index) => ({
      name: lesson.title,
      position: index + 1,
      durationLabel: lesson.durationLabel,
    })),
    objectives: course.objectives,
    breadcrumbs: [
      { name: tSeo("home"), url: buildCanonicalUrl(locale, "/") },
      { name: tSeo("courses"), url: coursesIndexUrl },
      { name: title, url: pageUrl },
    ],
  });

  return (
    <>
      <PageSchemaScript json={courseSchemaJson} />
      <SingleCoursePage course={course} />
    </>
  );
}
