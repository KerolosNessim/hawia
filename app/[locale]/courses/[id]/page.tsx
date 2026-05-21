import SingleCoursePage from "@/features/courses/components/single-course-page";
import { resolvePublicCourse } from "@/features/courses/services/courses-public-api";
import type { Locale } from "next-intl";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const course = await resolvePublicCourse(decodeURIComponent(id), locale);
  if (!course) redirectToNotFound();
  return <SingleCoursePage course={course} />;
}
