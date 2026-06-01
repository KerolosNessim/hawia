import { resolveLocalizedImageUrl } from "@/features/services/lib/pick-service-cover";
import { pickImageAlt } from "@/lib/image-alt";

export type WhyUsGalleryImage = {
  id: number;
  url: string;
  image_alt?: unknown;
};

export function resolveWhyUsCoverUrl(
  image: unknown,
  locale: string,
  images?: unknown,
): string | null {
  return resolveLocalizedImageUrl(image, locale, images);
}

export function resolveWhyUsFeatureImageUrl(
  media: { image?: unknown; images?: unknown } | undefined,
  locale: string,
): string | null {
  if (!media) return null;
  const url = resolveLocalizedImageUrl(media.image, locale, media.images);
  if (url) return url;
  if (typeof media.image === "string" && media.image.trim()) {
    return resolveLocalizedImageUrl(media.image, locale);
  }
  return null;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/** Gallery list from API (`images`, `gallery`, or Spatie `media[]`). */
export function pickWhyUsGalleryFromSection(section: unknown): WhyUsGalleryImage[] {
  const root = asRecord(section);
  if (!root) return [];

  const tryList = (raw: unknown): WhyUsGalleryImage[] => {
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (item): item is WhyUsGalleryImage =>
        !!item &&
        typeof item === "object" &&
        typeof (item as WhyUsGalleryImage).url === "string",
    );
  };

  const direct = tryList(root.images ?? root.gallery);
  if (direct.length > 0) return direct;

  const media = root.media;
  if (Array.isArray(media)) {
    const list = tryList(media);
    if (list.length > 0) return list;
  }

  const mediaRec = asRecord(media);
  if (mediaRec && Array.isArray(mediaRec.images)) {
    const nested = tryList(mediaRec.images);
    if (nested.length > 0 && typeof nested[0]?.url === "string") {
      return nested;
    }
  }

  return [];
}

export function mapGalleryImages(
  images: WhyUsGalleryImage[] | undefined,
  locale: string,
  fallbackTitle?: string,
): { id: number; url: string; alt: string }[] {
  if (!Array.isArray(images) || images.length === 0) return [];
  return images
    .map((img) => {
      const url = img.url?.trim();
      if (!url) return null;
      return {
        id: img.id,
        url,
        alt: pickImageAlt(img.image_alt, locale, fallbackTitle) || fallbackTitle || "",
      };
    })
    .filter((x): x is { id: number; url: string; alt: string } => x != null);
}
