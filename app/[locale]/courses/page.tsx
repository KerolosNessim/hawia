import { CoursesCatalog } from "@/features/courses/components/courses-catalog";
import PageHeader from "@/features/shared/components/page-header";
import { localePathname } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("courses");

  return (
    <div className="space-y-16 pb-16">
      <PageHeader title={t("title")} description={t("description")} image="/hero-bg.webp" />
      <CoursesCatalog />
    </div>
  );
}
