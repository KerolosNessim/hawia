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
    <section className="py-16 bg-gray-900 relative overflow-hidden">
      {/* Background decoration (optional similar wavy pattern but matching dark theme) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none text-white">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="articles-wavy"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 50 Q 25 25, 50 50 T 100 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#articles-wavy)" />
        </svg>
      </div>

      <div className="container  space-y-12">
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
