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
      className="group relative mx-2 flex h-32 w-44 shrink-0 items-center justify-center rounded-2xl border border-neutral-200/50 p-8 transition-all duration-300 hover:border-brand hover:bg-white"
    >
      <Image
        src={image}
        alt={alt ?? t("title")}
        width={180}
        height={80}
        unoptimized={isRemoteMediaUrl(image)}
        className="h-full w-full object-contain transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
      />
    </div>
  );

  if (isLoading || partnerImages.length === 0) return null;

  const sectionTitle = partnersList[0]?.title?.trim() || t("title");
  const sectionSubtitle = partnersList[0]?.description?.trim() || t("subtitle");

  return (
    <section className="space-y-8 overflow-hidden bg-gray-900 py-16">
      <SectionHeader title={sectionTitle} subtitleHtml={sectionSubtitle} />

      <div dir="ltr" className="relative space-y-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-linear-to-r from-gray-900 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-linear-to-l from-gray-900 to-transparent" />

        <Marquee
          direction={locale === "ar" ? "right" : "left"}
          speed={50}
          pauseOnHover
          autoFill
        >
          {partnerImages.map((partner, index) =>
            card(partner.url, `r1-${partner.url}-${index}`, partner.alt),
          )}
        </Marquee>

        <Marquee
          direction={locale === "ar" ? "left" : "right"}
          speed={50}
          pauseOnHover
          autoFill
        >
          {partnerImages.map((partner, index) =>
            card(partner.url, `r2-${partner.url}-${index}`, partner.alt),
          )}
        </Marquee>
      </div>
    </section>
  );
}
