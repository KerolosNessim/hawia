"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { RichHtml } from "@/features/shared/components/rich-html";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface Blog {
  title: string;
  /** Localized excerpt HTML from the CMS — rendered inside the card. */
  description: string;
  date: string;
  image: string;
  /** Blog post path — must work with `@/i18n/navigation` `Link`. */
  link: string;
}

export type BlogCardTheme = "light" | "dark";

interface BlogCardProps {
  article: Blog;
  index: number;
  isRtl: boolean;
  /** Match the parent section: dark sections → `"dark"`, light pages → `"light"`. */
  theme?: BlogCardTheme;
  /** @deprecated Prefer `theme="light"` */
  isLight?: boolean;
}

function resolveBlogCardTheme(theme?: BlogCardTheme, isLight?: boolean): BlogCardTheme {
  if (theme) return theme;
  return isLight ? "light" : "dark";
}

export default function BlogCard({
  article,
  index,
  isRtl,
  theme,
  isLight,
}: BlogCardProps) {
  const t = useTranslations("articlesSection");
  const cardTheme = resolveBlogCardTheme(theme, isLight);
  const isDark = cardTheme === "dark";

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Link
        href={article.link}
        className="group/card block h-full focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <Card
          data-blog-card-theme={cardTheme}
          className={`flex h-full flex-col overflow-hidden border border-brand p-0 transition-all duration-300 group-hover/card:border-brand/50 group-hover/card:shadow-xl ${
            isDark ? "bg-black/50 backdrop-blur-lg" : "bg-white"
          }`}
        >
          <CardHeader className="border-b-2 border-brand p-0">
            <div className="relative h-[240px] w-full overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority={index < 3}
                className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
              />
            </div>
          </CardHeader>

          <CardContent className="flex min-w-0 flex-1 flex-col overflow-hidden p-6 pt-8">
            <h3
              className={`mb-4 line-clamp-2 text-xl font-bold leading-snug transition-colors group-hover/card:text-brand ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {article.title}
            </h3>
            {article.description.trim() ? (
              <RichHtml
                html={article.description}
                className={`blog-card-excerpt mb-6 line-clamp-3 max-w-none text-sm leading-relaxed [&_p+_p]:mt-1 ${
                  isDark ? "text-white" : "text-gray-600"
                }`}
              />
            ) : null}

            <span className="mt-auto inline-flex items-center text-sm font-bold text-brand transition-colors group-hover/card:text-brand/80">
              {t("readMore")}
              {isRtl ? (
                <ChevronLeft className="ms-1 h-4 w-4" />
              ) : (
                <ChevronRight className="ms-1 h-4 w-4" />
              )}
            </span>
          </CardContent>

          <CardFooter
            className={`border-t border-brand p-4 ${isDark ? "bg-black/50 backdrop-blur-lg" : "bg-brand text-white"}`}
          >
            <span
              className={`w-full text-xs font-medium ${isDark ? "text-brand" : "text-white"}`}
            >
              {article.date}
            </span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
