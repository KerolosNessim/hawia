import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type { ServiceAiContent, ServiceAiContentItem } from "@/features/ai-services/types/service-ai-content";
import { pickLocalizedField } from "@/features/services/lib/pick-localized-field";
import { apiClient } from "@/lib/api";
import type { Locale } from "next-intl";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function extractPayload(raw: unknown): Record<string, unknown> | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  if (rec.id != null) return rec;
  const data = asRecord(rec.data);
  if (data?.id != null) return data;
  return null;
}

function pickLocalizedImage(row: Record<string, unknown>, locale: Locale): string | null {
  const pickOne = (value: unknown): string | null => {
    if (typeof value === "string" && value.trim()) return value.trim();
    return null;
  };

  const image = row.image;
  if (image && typeof image === "object" && !Array.isArray(image)) {
    const img = image as Record<string, unknown>;
    const localized =
      pickOne(pickLocalizedField(img, locale)) ||
      pickOne(img[locale]) ||
      pickOne(img.ar) ||
      pickOne(img.en);
    if (localized) return localized;
  }

  const images = row.images;
  if (images && typeof images === "object" && !Array.isArray(images)) {
    const img = images as Record<string, unknown>;
    const localized =
      pickOne(pickLocalizedField(img, locale)) ||
      pickOne(img[locale]) ||
      pickOne(img.ar) ||
      pickOne(img.en);
    if (localized) return localized;
  }

  return pickOne(image) ?? pickOne(row.image_ar) ?? pickOne(row.image_en);
}

function pickItemPreviewImage(row: Record<string, unknown>, locale: Locale): string {
  const previewRaw =
    typeof row.preview_image === "string"
      ? row.preview_image.trim()
      : pickLocalizedField(row.preview_image, locale).trim();

  const fromImages = pickLocalizedImage(row, locale);
  const path = previewRaw || fromImages;
  return path ? resolveMediaUrl(path) : "";
}

function normalizeItem(raw: unknown, index: number, locale: Locale): ServiceAiContentItem {
  const row = (raw ?? {}) as Record<string, unknown>;
  const video = pickLocalizedField(row.video, locale).trim();
  const subtitle =
    typeof row.subtitle === "string"
      ? row.subtitle.trim()
      : pickLocalizedField(row.subtitle, locale).trim();
  const description = pickLocalizedField(row.description, locale).trim();

  return {
    video,
    previewImage: pickItemPreviewImage(row, locale),
    subtitle,
    description,
    sort_order: Number(row.sort_order ?? index),
  };
}

function normalizeContent(row: Record<string, unknown>, locale: Locale): ServiceAiContent {
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  const imagePath = pickLocalizedImage(row, locale);

  return {
    id: Number(row.id ?? 0),
    title: pickLocalizedField(row.title, locale).trim(),
    description: pickLocalizedField(row.description, locale).trim(),
    meta_title: pickLocalizedField(row.meta_title ?? row.metaTitle, locale).trim(),
    meta_description: pickLocalizedField(row.meta_description ?? row.metaDescription, locale).trim(),
    image: imagePath ? resolveMediaUrl(imagePath) : null,
    image_alt: pickLocalizedField(row.image_alt ?? row.imageAlt, locale).trim(),
    items: itemsRaw
      .map((item, i) => normalizeItem(item, i, locale))
      .sort((a, b) => a.sort_order - b.sort_order),
    is_active: row.is_active === false || row.is_active === 0 || row.is_active === "0" ? false : true,
  };
}

/** Public CMS block from `GET /v1/service_ais/content`. */
export async function getServiceAiContent(locale: Locale = "ar"): Promise<ServiceAiContent | null> {
  try {
    const raw = await apiClient.get<unknown>("/v1/service_ais/content");
    const row = extractPayload(raw);
    if (!row || Number(row.id ?? 0) <= 0) return null;
    return normalizeContent(row, locale);
  } catch {
    return null;
  }
}
