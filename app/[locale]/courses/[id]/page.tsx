import SingleCoursePage from "@/features/courses/components/single-course-page";
import { resolvePublicCourse } from "@/features/courses/services/courses-public-api";
import type { Locale } from "next-intl";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const course = await resolvePublicCourse(decodeURIComponent(id), locale);
  if (!course) notFound();
  return <SingleCoursePage course={course} />;
}
