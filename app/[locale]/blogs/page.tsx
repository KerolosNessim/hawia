"use client";
import BlogCard from '@/features/blogs/components/blog-card';
import PageHeader from '@/features/shared/components/page-header'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

export default function BlogPage() {
  const t = useTranslations("articlesSection");
    const locale = useLocale();
    const isRtl = locale === "ar";

    const articles = t.raw("items") as {
      title: string;
      description: string;
      date: string;
      image: string;
      link: string;
    }[];
  return (
    <div className="pb-16 space-y-16">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        image="/blogs-banner.jfif"
      />
      <div className="container  space-y-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {articles.map((article, index) => (
            <BlogCard
              key={index}
              article={article}
              index={index}
              isRtl={isRtl}
              t={t}
              isLight
            />
          ))}
        </div>
      </div>
    </div>
  );
}
