import SectionHeader from '@/features/shared/components/section-header'
import React from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import * as motion from "motion/react-client"
export default function AdsSection() {
  const t = useTranslations("adsSection")

  const items = [
    {
      title: t("seo"),
      img: "/ads-1.webp",
    },
    {
      title: t("ads"),
      img: "/ads-2.webp",
    },
    {
      title: t("programming"),
      img: "/ads-3.webp",
    },
    {
      title: t("graphic"),
      img: "/ads-4.webp",
    },
  ]
  return (
    <section className="py-16 space-y-8 bg-gray-900 relative overflow-hidden">
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
            </pattern>{" "}
            pattern
          </defs>
          <rect width="100%" height="100%" fill="url(#wavy)" />
        </svg>
      </div>

      <div className="container px-4 relative z-10">
        <SectionHeader title={t("title")} subtitle={t("subtitle")} />
      </div>

      <div className="container px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: index * 0.2 }}
              key={index}
              className="text-gray-900 bg-linear-to-b from-brand to-white rounded-lg p-6  text-center hover:from-white hover:to-brand hover:text-white transition-all  duration-300 "
            >
              <Image
                src={item.img}
                alt={item.title}
                width={100}
                height={100}
                className="size-50 object-contain mx-auto"
              />
              <h3 className="text-xl font-extrabold my-2">
                {item.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
