"use client";

import { Button } from "@/components/ui/button";
import PageHeader from "@/features/shared/components/page-header";
import type { ResolvedCourseLesson, ResolvedPublicCourse } from "@/features/courses/services/courses-public-api";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { CheckCircle2, ChevronDown, ChevronUp, PlayCircle, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

function CurriculumFlat({ lessons }: { lessons: ResolvedCourseLesson[] }) {
  const [open, setOpen] = useState(true);
  const t = useTranslations("courses");

  if (!lessons.length) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mb-2 flex w-full items-center justify-between text-start"
      >
        <h2 className="text-2xl font-bold text-gray-900">{t("curriculum_title")}</h2>
        {open ? <ChevronUp size={20} className="shrink-0 text-gray-400" /> : <ChevronDown size={20} className="shrink-0 text-gray-400" />}
      </button>
      <p className="mb-5 text-sm text-gray-500">
        {t("lesson_count", { count: lessons.length })}
      </p>

      {open && (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200">
          {lessons.map((lesson, li) => (
            <div key={lesson.id ?? li} className="flex items-center justify-between gap-3 bg-gray-50/40 px-5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <PlayCircle size={16} className="shrink-0 text-brand" />
                <span className="truncate text-sm text-gray-700">{lesson.title}</span>
                {lesson.preview && (
                  <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
                    {t("preview_badge")}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-xs text-gray-400">
                {lesson.durationLabel?.trim() ? lesson.durationLabel : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseSidebar({ course }: { course: ResolvedPublicCourse }) {
  const t = useTranslations("courses");

  return (
    <div className="sticky top-24 space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
        <Image
          src={course.imageSrc}
          alt={course.title}
          width={600}
          height={340}
          className="aspect-video w-full object-cover"
          unoptimized={isRemoteMediaUrl(course.imageSrc)}
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-3xl font-extrabold text-gray-900">{course.priceLabel}</span>
          {course.comparePriceLabel && (
            <span className="text-xs text-gray-400 line-through">{course.comparePriceLabel}</span>
          )}
        </div>

        <Button className="h-12 w-full gap-2 rounded-xl bg-brand text-base font-bold text-white shadow-md transition-all hover:bg-brand/90 hover:shadow-lg">
          <ShoppingCart size={18} />
          {t("enroll_cta")}
        </Button>
      </div>
    </div>
  );
}

export default function SingleCoursePage({ course }: { course: ResolvedPublicCourse }) {
  const t = useTranslations("courses");
  const richTextClassName =
    "space-y-3 text-sm leading-relaxed text-gray-600 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={course.title} image={course.imageSrc} />

      <div className="container py-12">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {course.description.trim() ? (
              <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-gray-900">{t("about_title")}</h2>
                <div
                  className={richTextClassName}
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </section>
            ) : null}

            {course.objectives.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                <h2 className="mb-5 text-xl font-bold text-gray-900">{t("objectives_title")}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {course.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand" />
                      <div
                        className="min-w-0 flex-1 space-y-2 text-sm text-gray-700 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5"
                        dangerouslySetInnerHTML={{ __html: obj }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {course.lessons.length > 0 ? (
              <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                <CurriculumFlat lessons={course.lessons} />
              </section>
            ) : null}
          </div>

          <div className="lg:col-span-1">
            <CourseSidebar course={course} />
          </div>
        </div>
      </div>
    </div>
  );
}
