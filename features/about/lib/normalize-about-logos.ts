import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { extractPartnersFromResponse } from "@/features/home/services/partners";
import type { Accreditation, Partner, PartnersResponse } from "@/features/home/types";
import type { LogoTileItem } from "@/features/shared/components/logo-tiles-section";
import { pickImageAlt } from "@/lib/image-alt";
import type { Locale } from "next-intl";

export function normalizeAccreditationForAbout(
  raw: Accreditation | undefined,
): Accreditation | undefined {
  if (!raw?.images?.length) return undefined;
  return {
    ...raw,
    images: raw.images.map((img) => ({
      ...img,
      url: resolveMediaUrl(img.url),
    })),
  };
}

export function accreditationToLogoTiles(
  accreditation: Accreditation | undefined,
  locale: Locale,
): LogoTileItem[] {
  if (!accreditation?.images?.length) return [];
  return accreditation.images.map((img) => ({
    url: img.url,
    alt: pickImageAlt(img.image_alt, locale, accreditation.title) || undefined,
  }));
}

export function partnersToLogoTiles(partners: Partner[], locale: Locale): LogoTileItem[] {
  return partners.flatMap((partner) =>
    (partner.images ?? []).map((img) => ({
      url: resolveMediaUrl(img.url),
      alt: pickImageAlt(img.image_alt, locale, partner.title) || undefined,
    })),
  );
}

export function getPartnersListFromResponse(res: PartnersResponse | null): Partner[] {
  if (!res) return [];
  return extractPartnersFromResponse(res);
}
