"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

import {
  Search,
  Users,
  TrendingUp,
  FileText,
  BarChart2,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
} from "lucide-react";
import SectionHeader from "@/features/shared/components/section-header";

const icons = [TrendingUp, Search, BarChart2, Users, FileText];

export default function StepsSection() {
  const t = useTranslations("stepsSection");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const items = t.raw("items") as {
    title: string;
    description: string;
  }[];

  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden">
      {/* Decorative Wavy Background Pattern (Simplified) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none text-brand">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="wavy"
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
            </pattern> pattern
          </defs>
          <rect width="100%" height="100%" fill="url(#wavy)" />
        </svg>
      </div>

      <div className="container  px-4 relative z-10">
        <SectionHeader title={t("title")} />

        {/* Desktop Staggered Layout */}
        <div className="hidden lg:flex items-center justify-between gap-4 mt-20 min-h-[400px]">
          {items.map((step, index) => {
            const Icon = icons[index % icons.length];
            const isUp = index % 2 === 0;

            return (
              <div key={index} className="flex-1 flex items-center relative">
                {/* Step Item */}
                <motion.div
                  initial={{ opacity: 0, y: isUp ? -20 : 20 }}
                  whileInView={{ opacity: 1, y: isUp ? -60 : 60 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center w-full"
                >
                  <div className="relative">
                    {/* Circle Icon */}
                    <div className="w-28 h-28 rounded-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex items-center justify-center border border-gray-100 group hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-brand" />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-center">
                    <span className="text-4xl font-black text-brand leading-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-bold text-xl mt-3 text-brand">
                      {step.title}
                    </h3>
                    <p className="text-gray-200 mt-2 text-sm max-w-[180px] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Arrow - Centered between items */}
                {index !== items.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2 + 0.4 }}
                    viewport={{ once: true }}
                    style={{ left: isRTL ? "auto" : "100%", right: isRTL ? "100%" : "auto" }}
                  >
                    {isRTL ? (
                      <ArrowLeft className="w-8 h-8 text-gray-300" />
                    ) : (
                      <ArrowRight className="w-8 h-8 text-gray-300" />
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Layout */}
        <div className="flex flex-col gap-6 lg:hidden mt-12">
          {items.map((step, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center border border-gray-100 mb-6">
                  <Icon className="w-10 h-10 text-brand" />
                </div>
                <span className="text-3xl font-black text-brand leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-bold text-xl mt-2 text-brand">
                  {step.title}
                </h3>
                <p className="text-gray-200 mt-2 text-sm max-w-xs">{step.description}</p>
                {index !== items.length - 1 && (
                  <ArrowDown className="mt-8 text-gray-300 w-6 h-6 animate-bounce" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
