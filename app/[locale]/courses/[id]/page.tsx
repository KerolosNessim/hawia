import SingleCoursePage from "@/features/courses/components/single-course-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SingleCoursePage courseParam={id} />;
}
