"use client";

import type { BlogCardPayload } from "@/features/blogs/lib/blog-card-payload";
import SectionHeader from "@/features/shared/components/section-header";
import { useLocale, useTranslations } from "next-intl";
import BlogCard from "./blog-card";

export default function RelatedBlogsSection({ articles }: { articles: BlogCardPayload[] }) {
  const tDetail = useTranslations("blogDetail");
  const locale = useLocale();
  const isRtl = locale === "ar";

  if (!articles.length) return null;

  return (
    <section className="background-dark-img relative overflow-hidden py-16">
      <div className="container space-y-12">
        <SectionHeader
          title={tDetail("relatedTitle")}
          titleColor="text-white"
          subtitleColor="text-gray-400"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {articles.map((article, index) => (
            <BlogCard
              key={article.link}
              article={article}
              index={index}
              isRtl={isRtl}
              theme="dark"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
