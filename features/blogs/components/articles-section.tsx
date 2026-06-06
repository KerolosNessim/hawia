"use client";

import type { BlogCardPayload } from "@/features/blogs/lib/blog-card-payload";
import SectionHeader from "@/features/shared/components/section-header";
import { useLocale, useTranslations } from "next-intl";
import BlogCard from "./blog-card";

type FallbackItem = {
  title: string;
  description: string;
  date: string;
  image: string;
  link: string;
};

export default function ArticlesSection({ items }: { items?: BlogCardPayload[] }) {
  const t = useTranslations("articlesSection");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const articles = (items ??
    (t.raw("items") as FallbackItem[])) as BlogCardPayload[];

  return (
    <section className="background-dark-img relative overflow-hidden bg-opacity-50 py-16">
      <div className="container relative z-10 min-w-0 max-w-full space-y-12 px-4">
        <SectionHeader
          title={t("title")}
          subtitle={t("subtitle")}
          titleColor="text-white"
          subtitleColor="text-gray-400"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {articles.map((article, index) => (
            <BlogCard
              key={article.link ?? index}
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
