import { CourseCard } from '@/features/courses/components/course-crad'
import PageHeader from '@/features/shared/components/page-header'
import { useTranslations } from 'next-intl'
import React from 'react'

export default function CoursesPage() {
  const t = useTranslations("courses")
  return (
        <div className="space-y-16 pb-16">
      <PageHeader
        title={t("title")}
        description={t("description")}
        image="/hero-bg.webp"
      />
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CourseCard />
      </div>
      </div>
  )
}