import { CoursesCatalog } from "@/features/courses/components/courses-catalog";
import { fetchCoursesCatalog } from "@/features/courses/services/courses-public-api";
import PageHeader from "@/features/shared/components/page-header";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { localePathname } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import {
  buildBreadcrumbList,
  buildCollectionPageSchemaGraph,
  buildCanonicalUrl,
  jsonLdGraph,
} from "@/lib/seo/schema";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "courses" });
  const loc = locale as Locale;

  return buildStaticPageMetadata({
    locale: loc,
    pathname: localePathname(loc, "/courses"),
    pageKey: "courses",
    title: t("title"),
    description: t("description"),
  });
}

export default async function CoursesPage({ params }: Props) {
  await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("courses");
  const tSeo = await getTranslations({ locale, namespace: "seo.breadcrumb" });

  const pageUrl = buildCanonicalUrl(locale, "/courses");
  let courses: Awaited<ReturnType<typeof fetchCoursesCatalog>> = [];
  try {
    courses = await fetchCoursesCatalog(locale);
  } catch {
    // catalog component handles error UI
  }

  const coursesSchemaJson = jsonLdGraph([
    ...buildCollectionPageSchemaGraph({
      pageUrl,
      name: t("title"),
      description: t("description"),
      inLanguage: locale === "ar" ? "ar" : "en",
      breadcrumbs: [],
      items: courses.map((course) => ({
        name: plainTextFromHtml(course.title) || course.title,
        url: buildCanonicalUrl(
          locale,
          `/courses/${encodeURIComponent(course.slug ?? course.id)}`,
        ),
      })),
      listIdSuffix: "courses",
    }),
    buildBreadcrumbList(
      [
        { name: tSeo("home"), url: buildCanonicalUrl(locale, "/") },
        { name: tSeo("courses"), url: pageUrl },
      ],
      pageUrl,
    ),
  ]);

  return (
    <div className="space-y-16 pb-16">
      <PageSchemaScript json={coursesSchemaJson} />
      <PageHeader title={t("title")} description={t("description")} image="/hero-bg.webp" />
      <CoursesCatalog />
    </div>
  );
}
