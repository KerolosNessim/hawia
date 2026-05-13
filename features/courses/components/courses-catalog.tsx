import { fetchCoursesCatalog } from "@/features/courses/services/courses-public-api";
import { CourseCard } from "@/features/courses/components/course-card";
import { getLocale, getTranslations } from "next-intl/server";

export async function CoursesCatalog() {
  const locale = await getLocale();
  const t = await getTranslations("courses");
  let items = [];

  try {
    items = await fetchCoursesCatalog(locale);
  } catch {
    return <p className="container text-center text-muted-foreground">{t("catalog_error")}</p>;
  }

  if (items.length === 0) {
    return <p className="container text-center text-muted-foreground">{t("catalog_empty")}</p>;
  }

  return (
    <div className="container grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <CourseCard
          key={c.id}
          href={`/courses/${c.slug ?? c.id}`}
          title={c.title}
          description={c.description}
          priceLabel={c.priceLabel}
          imageSrc={c.imageSrc}
        />
      ))}
    </div>
  );
}
