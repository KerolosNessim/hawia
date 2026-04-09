"use client";
import SectionHeader from "@/features/shared/components/section-header";
import { useTranslations, useLocale } from "next-intl";
import Marquee from "react-fast-marquee";
import Image from "next/image";

const images = [
  "/dep-1.png",
  "/dep-2.png",
  "/dep-3.png",
  "/dep-4.png",
  "/dep-5.png",
];

export default function DependenciesSection() {
  const t = useTranslations("dependenciesSection");
  const locale = useLocale();

  const card = (image: string, index: number, alt?: string) => (
    <div
      key={index}
      className="group relative mx-2 flex items-center justify-center h-32 w-44 shrink-0 rounded-2xl border border-neutral-200/50 bg-neutral-50/30 p-8 transition-all duration-300 hover:border-primary/30 hover:bg-neutral-50/50 dark:border-neutral-800/50 dark:bg-neutral-900/30 dark:hover:border-primary/30 dark:hover:bg-neutral-900/50"
    >
      <Image
        src={image}
        alt={alt ?? `${t("title")} ${index}`}
        width={180}
        height={80}
        className="h-full w-full object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
      />
    </div>
  );

  return (
    <section className="container py-16 space-y-8 overflow-hidden">
      <SectionHeader
        title={t("title")}
        subtitle={t("subtitle")}
        subtitleColor="text-gray-500"
      />

      <div dir="ltr" className="space-y-8 relative">
        {/* Gradient Masks */}
        <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Row 1: natural direction */}
        <Marquee
          direction={locale === "ar" ? "right" : "left"}
          speed={50}
          pauseOnHover
          autoFill
        >
          {images.map((image, index) => card(image, index))}
        </Marquee>

        {/* Row 2: opposite direction */}
        <Marquee
          direction={locale === "ar" ? "left" : "right"}
          speed={50}
          pauseOnHover
          autoFill
        >
          {images.map((image, index) => card(image, index))}
        </Marquee>
      </div>
    </section>
  );
}
