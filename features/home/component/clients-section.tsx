"use client";
import SectionHeader from "@/features/shared/components/section-header";
import { useTranslations, useLocale } from "next-intl";
import Marquee from "react-fast-marquee";
import Image from "next/image";

const images = [
  "/client-1.webp",
  "/client-2.webp",
  "/client-3.webp",
  "/client-4.webp",
  "/client-5.webp",
  "/client-6.avif",
];

export default function ClientsSection() {
  const t = useTranslations("clientsSection");
  const locale = useLocale();

  const card = (image: string, index: number, alt?: string) => (
    <div
      key={index}
      className="group relative mx-2 flex items-center justify-center h-32 w-44 shrink-0 rounded-2xl border border-neutral-200/50  p-8 transition-all duration-300 hover:border-brand hover:bg-white "
    >
      <Image
        src={image}
        alt={alt ?? `${t("title")} ${index}`}
        width={180}
        height={80}
        className="h-full w-full object-contain  transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
      />
    </div>
  );

  return (
    <section className=" py-16 space-y-8 overflow-hidden bg-gray-900">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div dir="ltr" className="space-y-8 relative">
        {/* Gradient Masks */}
        <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-gray-900 to-transparent z-10 pointer-events-none" />

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
        {/* Row 3: natural direction */}
        <Marquee
          direction={locale === "ar" ? "right" : "left"}
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
