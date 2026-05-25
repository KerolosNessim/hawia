import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";

function pickLocalizedPath(field: unknown, locale: string): string {
  if (field == null) return "";
  if (typeof field === "string") {
    const s = field.trim();
    return s || "";
  }
  if (typeof field === "object" && !Array.isArray(field)) {
    const o = field as Record<string, unknown>;
    const key = locale.startsWith("ar") ? "ar" : "en";
    const primary = o[key];
    if (typeof primary === "string" && primary.trim()) return primary.trim();
    const fallback = o.en ?? o.ar;
    if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
  }
  return "";
}

/**
 * Resolves the cover path for the active locale from API shapes:
 * - localized string (Accept-Language)
 * - `image: { ar, en }`
 * - `images: { ar, en }` (alias)
 */
export function pickServiceCoverPath(
  image: unknown,
  locale: string,
  images?: unknown,
): string {
  const fromImage = pickLocalizedPath(image, locale);
  if (fromImage) return fromImage;
  return pickLocalizedPath(images, locale);
}

/** Absolute URL for the active locale (`image` string, `{ ar, en }`, or `images` alias). */
export function resolveLocalizedImageUrl(
  image: unknown,
  locale: string,
  images?: unknown,
): string | null {
  const path = pickServiceCoverPath(image, locale, images);
  if (!path.trim()) return null;
  return resolveMediaUrl(path);
}
