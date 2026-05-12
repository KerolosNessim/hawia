"use client";

import { CourseCard } from "@/features/courses/components/course-card";
import { STATIC_CATALOG_FOR_UI } from "@/features/courses/lib/static-course-mocks";

/** Temporary grid for UI preview without calling the courses API. */
export function CoursesCatalogStatic() {
  return (
    <div className="container grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {STATIC_CATALOG_FOR_UI.map((c) => (
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
