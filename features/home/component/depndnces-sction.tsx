"use client";
import SectionHeader from "@/features/shared/components/section-header";
import { useTranslations, useLocale } from "next-intl";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { pickImageAlt } from "@/lib/image-alt";
import { Link } from "@/i18n/navigation";
import { pickServiceSlug, servicePostPath } from "@/features/services/lib/services-routes";
import { pickLocalizedField } from "@/features/services/lib/pick-localized-field";

import type { Accreditation } from "../types";

export default function DependenciesSection({ accreditation }: { accreditation?: Accreditation }) {
  const t = useTranslations("dependenciesSection");
  const locale = useLocale();

  const images =
    accreditation?.images?.map((img) => ({
      url: img.url,
      alt: pickImageAlt(img.image_alt, locale, accreditation?.title) || undefined,
      services: img.services ?? [],
    })) ?? [];

  const card = (
    image: string,
    index: number,
    alt?: string,
    services: NonNullable<Accreditation["images"][number]["services"]> = [],
  ) => {
    const service = services[0];
    const serviceSlug = service
      ? pickServiceSlug(
          {
            slug: service.slug ?? "",
            slug_local: {
              ar: service.slug_local?.ar ?? undefined,
              en: service.slug_local?.en ?? undefined,
            },
          },
          locale,
        )
      : "";
    const serviceTitle = service
      ? pickLocalizedField(service.title, locale) || (locale === "ar" ? "عرض الخدمة" : "View service")
      : "";

    const inner = (
    <div
      key={index}
      className="group relative mx-2 flex h-32 w-44 shrink-0 items-center justify-center rounded-2xl border border-neutral-200/50 bg-neutral-50/30 p-8 transition-all duration-300 hover:border-brand hover:bg-neutral-50/50 dark:border-neutral-800/50 dark:bg-neutral-900/30 dark:hover:border-primary/30 dark:hover:bg-neutral-900/50"
    >
      <Image
        src={image}
        alt={alt ?? `${t("title")} ${index}`}
        width={180}
        height={80}
        unoptimized={isRemoteMediaUrl(image)}
        className="h-full w-full object-contain  transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
      />
    </div>
    );

    return serviceSlug ? (
      <Link
        key={index}
        href={servicePostPath(serviceSlug)}
        aria-label={serviceTitle}
        className="block"
      >
        {inner}
      </Link>
    ) : (
      inner
    );
  };

  if (images.length === 0) return null;

  return (
    <section className=" py-16 space-y-8 overflow-hidden">
      <div className="container max-w-6xl ">
      <SectionHeader
        title={accreditation?.title || t("title")}
        subtitleHtml={accreditation?.description || t("subtitle")}
        subtitleColor="text-gray-500"
      />
      </div>

      <div dir="ltr" className="relative max-w-full space-y-8 overflow-x-hidden">
        {/* Gradient Masks */}
        <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Row 1: natural direction */}
        <div className="max-w-full overflow-hidden">
          <Marquee
            direction={locale === "ar" ? "right" : "left"}
            speed={50}
            pauseOnHover
            autoFill
          >
            {images.map((image, index) => card(image.url, index, image.alt, image.services))}
          </Marquee>
        </div>

        {/* Row 2: opposite direction */}
        <div className="max-w-full overflow-hidden">
          <Marquee
            direction={locale === "ar" ? "left" : "right"}
            speed={50}
            pauseOnHover
            autoFill
          >
            {images.map((image, index) => card(image.url, index, image.alt, image.services))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
