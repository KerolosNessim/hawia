import { CoursesCatalog } from "@/features/courses/components/courses-catalog";
import PageHeader from "@/features/shared/components/page-header";
import { getTranslations } from "next-intl/server";

export default async function CoursesPage() {
  const t = await getTranslations("courses");
  return (
    <div className="space-y-16 pb-16">
      <PageHeader title={t("title")} description={t("description")} image="/hero-bg.webp" />
      <CoursesCatalog />
    </div>
  );
}
