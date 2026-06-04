"use client";

import LogoMarqueeSection from "@/features/shared/components/logo-marquee-section";
import { useTranslations, useLocale } from "next-intl";
import { pickImageAlt } from "@/lib/image-alt";
import { usePartners } from "../hooks/usePartners";
import type { LandingPageData, Partner } from "../types";

type ClientsSectionProps = {
  countryId?: number;
  initialPartners?: LandingPageData["partners"] | Partner[];
};

export default function ClientsSection({
  countryId,
  initialPartners,
}: ClientsSectionProps) {
  const t = useTranslations("clientsSection");
  const locale = useLocale();
  const { partners: partnersList, isLoading } = usePartners({
    countryId,
    initialPartners,
  });

  const partnerImages = partnersList.flatMap((partner) => {
    const images = Array.isArray(partner.images) ? partner.images : [];
    return images.map((img) => ({
      url: img.url,
      alt: pickImageAlt(img.image_alt, locale, partner.title) || undefined,
    }));
  });

  if (isLoading || partnerImages.length === 0) return null;

  const sectionTitle = partnersList[0]?.title?.trim() || t("title");
  const sectionSubtitle = partnersList[0]?.description?.trim() || t("subtitle");

  return (
    <LogoMarqueeSection
      title={sectionTitle}
      subtitleHtml={sectionSubtitle}
      images={partnerImages}
      variant="white"
      rowCount={3}
    />
  );
}
