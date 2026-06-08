"use client";

import type { Accreditation } from "@/features/home/types";
import LogoMarqueeSection from "@/features/shared/components/logo-marquee-section";
import { pickImageAlt } from "@/lib/image-alt";
import { useLocale } from "next-intl";

type Props = {
  partners?: Accreditation | null;
};

/** Per-service `our_partners` block — same marquee layout as home `ClientsSection`. */
export default function ServiceOurPartnersSection({ partners }: Props) {
  const locale = useLocale();

  const images =
    partners?.images?.map((img) => ({
      url: img.url,
      alt: pickImageAlt(img.image_alt, locale, partners.title) || undefined,
    })) ?? [];

  if (!images.length) return null;

  return (
    <LogoMarqueeSection
      title={partners?.title?.trim() || ""}
      subtitleHtml={partners?.description?.trim() || undefined}
      images={images}
      variant="white"
      rowCount={3}
    />
  );
}
