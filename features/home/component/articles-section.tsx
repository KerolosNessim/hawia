"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import SectionHeader from "@/features/shared/components/section-header";

export default function ArticlesSection() {
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
    <section className="py-20 bg-gray-900 relative overflow-hidden">
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
        <SectionHeader title={t("title")} subtitle={t("subtitle")}  />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {articles.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="p-0 h-full flex flex-col bg-gray-900  border border-brand overflow-hidden hover:shadow-xl hover:border-brand/50 transition-all duration-300">
                <CardHeader className="p-0 border-b-2 border-brand">
                  <div className="relative w-full h-[240px]  overflow-hidden">
                    <Image
                      src={"/blog.webp"}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 flex-1 flex flex-col pt-8 ">
                  <h3 className="text-xl font-bold mb-4 text-white leading-snug line-clamp-2 hover:text-brand transition-colors cursor-pointer">
                    {article.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                    {article.description}
                  </p>
                  
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
                
                <CardFooter className="border-t border-brand p-4 bg-gray-900">
                  <span className="text-xs text-brand font-medium w-full  ">
                    {article.date}
                  </span>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
