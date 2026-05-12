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

interface BlogCardProps {
  article: Blog;
  index: number;
  isRtl: boolean;
  isLight?: boolean;
}

export default function BlogCard({
  article,
  index,
  isRtl,
  isLight = false,
}: BlogCardProps) {
  const t = useTranslations("articlesSection");
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card
        className={`p-0 h-full flex flex-col ${isLight ? "bg-white" : "bg-gray-900  border "} border-brand overflow-hidden hover:shadow-xl hover:border-brand/50 transition-all duration-300`}
      >
        <CardHeader className="p-0 border-b-2 border-brand">
          <div className="relative w-full h-[240px]  overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority={index < 3}
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            />
          </div>
        </CardHeader>

        <CardContent className="p-6 flex-1 flex flex-col pt-8 ">
          <h3 className={`text-xl font-bold mb-4  leading-snug line-clamp-2 hover:text-brand transition-colors cursor-pointer ${isLight ? "text-gray-900" : "text-white"}`}>
            {article.title}
          </h3>
          {article.description.trim() ? (
            <div
              dir={isRtl ? "rtl" : "ltr"}
              className={`blog-card-excerpt text-sm leading-relaxed mb-6 line-clamp-3 max-w-none [&_p]:mb-0 [&_p+_p]:mt-1 [&_a]:font-semibold [&_a]:text-brand [&_strong]:font-semibold ${isLight ? "text-gray-500" : "text-gray-300"}`}
              dangerouslySetInnerHTML={{ __html: article.description }}
            />
          ) : null}

          <div className="mt-auto">
            <Link
              href={article.link}
              className="inline-flex items-center text-brand font-bold hover:text-brand/80 transition-colors text-sm"
            >
              {t("readMore")}
              {isRtl ? (
                <ChevronLeft className="ms-1 w-4 h-4" />
              ) : (
                <ChevronRight className="ms-1 w-4 h-4" />
              )}
            </Link>
          </div>
        </CardContent>

        <CardFooter className={`border-t border-brand p-4 ${isLight ? "bg-brand text-white" : "bg-gray-900"}`}>
          <span className={`text-xs font-medium w-full  ${isLight ? "text-white" : "text-brand"}`}>
            {article.date}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
