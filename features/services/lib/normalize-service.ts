import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { pickImageAlt } from "@/lib/image-alt";
import type { Service, ServiceCountry } from "../types";
import { pickLocalizedField, pickSlugLocal } from "./pick-localized-field";
import { pickServiceCoverPath } from "./pick-service-cover";

function normalizeCountries(raw: unknown): ServiceCountry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c) => c && typeof c === "object")
    .map((c) => {
      const row = c as Record<string, unknown>;
      const name = row.name;
      const nameObj =
        name && typeof name === "object" && !Array.isArray(name)
          ? {
              ar: String((name as Record<string, unknown>).ar ?? ""),
              en: String((name as Record<string, unknown>).en ?? ""),
            }
          : { ar: String(name ?? ""), en: String(name ?? "") };
      return {
        id: Number(row.id ?? 0),
        name: nameObj,
        image: typeof row.image === "string" ? row.image : "",
        is_active: row.is_active !== false,
      };
    });
}

/** Normalizes a list/detail row from GET /v1/services for the active locale. */
export function normalizeServiceForLocale(
  raw: Record<string, unknown>,
  locale: string,
): Service {
  const coverPath = pickServiceCoverPath(raw.image, locale, raw.images);
  const slugLocal = pickSlugLocal(raw);

  return {
    id: Number(raw.id ?? 0),
    slug: String(raw.slug ?? ""),
    slug_local: slugLocal,
    image: coverPath ? resolveMediaUrl(coverPath) : "",
    image_alt: pickImageAlt(raw.image_alt, locale) || null,
    title: pickLocalizedField(raw.title, locale),
    subtitle: pickLocalizedField(raw.subtitle, locale),
    description: pickLocalizedField(raw.description, locale),
    sort_order: Number(raw.sort_order ?? 0),
    is_active: raw.is_active !== false,
    highlight_description: pickLocalizedField(raw.highlight_description, locale),
    media_url: typeof raw.media_url === "string" ? raw.media_url : "",
    media_type: String(raw.media_type ?? "image"),
    meta_title: pickLocalizedField(raw.meta_title, locale),
    meta_description: pickLocalizedField(raw.meta_description, locale),
    countries: normalizeCountries(raw.countries),
    created_at: String(raw.created_at ?? ""),
  };
}

export function normalizeServicesForLocale(
  rows: unknown[],
  locale: string,
): Service[] {
  return rows
    .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
    .map((row) => normalizeServiceForLocale(row, locale));
}
