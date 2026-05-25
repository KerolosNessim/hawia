"use client";

import SectionHeader from "@/features/shared/components/section-header";
import { useTranslations, useLocale } from "next-intl";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { pickImageAlt } from "@/lib/image-alt";
import { usePartners } from "../hooks/usePartners";

export default function ClientsSection() {
  const t = useTranslations("clientsSection");
  const locale = useLocale();
  const { partners: partnersList, isLoading } = usePartners();

  const partnerImages = partnersList.flatMap((partner) => {
    const images = Array.isArray(partner.images) ? partner.images : [];
    return images.map((img) => ({
      url: img.url,
      alt: pickImageAlt(img.image_alt, locale, partner.title) || undefined,
    }));
  });

  const card = (image: string, key: string, alt?: string) => (
    <div
      key={key}
      className="group relative mx-2 flex h-32 w-44 shrink-0 items-center justify-center rounded-2xl border border-neutral-200/60 bg-neutral-50/40 p-8 transition-all duration-300 hover:border-brand hover:shadow-md"
    >
      <Image
        src={image}
        alt={alt ?? t("title")}
        width={180}
        height={80}
        unoptimized={isRemoteMediaUrl(image)}
        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );

  const partnerRows = Array.from({ length: 3 }, () => [] as typeof partnerImages);
  partnerImages.forEach((partner, index) => {
    partnerRows[index % 3].push(partner);
  });

  if (isLoading || partnerImages.length === 0) return null;

  const sectionTitle = partnersList[0]?.title?.trim() || t("title");
  const sectionSubtitle = partnersList[0]?.description?.trim() || t("subtitle");

  return (
    <section className="space-y-8 overflow-hidden bg-white py-16">
      <SectionHeader
        title={sectionTitle}
        subtitleHtml={sectionSubtitle}
        subtitleColor="text-gray-500"
      />

      <div dir="ltr" className="relative max-w-full space-y-6 overflow-x-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-linear-to-l from-white to-transparent" />

        {partnerRows.map((rowPartners, rowIndex) => {
          if (rowPartners.length === 0) return null;

          const isReverse = rowIndex % 2 === 1;
          const direction = locale === "ar"
            ? isReverse ? "left" : "right"
            : isReverse ? "right" : "left";

          return (
            <div key={rowIndex} className="max-w-full overflow-hidden">
              <Marquee direction={direction} speed={50} pauseOnHover autoFill>
                {rowPartners.map((partner, index) =>
                  card(
                    partner.url,
                    `r${rowIndex}-${partner.url}-${index}`,
                    partner.alt,
                  ),
                )}
              </Marquee>
            </div>
          );
        })}
      </div>
    </section>
  );
}
