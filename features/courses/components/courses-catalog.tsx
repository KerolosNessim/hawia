"use client";

import { fetchCoursesCatalog } from "@/features/courses/services/courses-public-api";
import { CourseCard } from "@/features/courses/components/course-card";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

export function CoursesCatalog() {
  const locale = useLocale();
  const t = useTranslations("courses");

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["courses-catalog", locale],
    queryFn: () => fetchCoursesCatalog(locale),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="container grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[360px] animate-pulse rounded-2xl bg-muted/40" />
        ))}
      </div>
    );
  }

  if (isError) {
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
          priceLabel={c.priceLabel}
          imageSrc={c.imageSrc}
        />
      ))}
    </div>
  );
}
