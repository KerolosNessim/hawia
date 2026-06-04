import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { JobOpening } from "@/features/careers/types/jobs";

export type JobSlugLocale = "ar" | "en";

function slugifyLatin(text: string): string {
  const withHyphens = text.trim().toLowerCase().replace(/\s+/g, "-");
  const cleaned = withHyphens.replace(/[^\w-]+/g, "");
  return cleaned.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function slugifyArabic(text: string): string {
  const spaced = text.trim().toLowerCase().replace(/\s+/g, "-");
  const allowed = spaced.replace(
    /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\d-]+/gu,
    "",
  );
  return allowed.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

export function slugifyJobTitle(text: string, locale: JobSlugLocale): string {
  const plain = plainTextFromHtml(text).trim();
  if (!plain) return "";
  return locale === "ar" ? slugifyArabic(plain) : slugifyLatin(plain);
}

export function pickJobOpeningSlug(opening: JobOpening, locale: string): string {
  const key: JobSlugLocale = locale.startsWith("ar") ? "ar" : "en";
  const otherKey: JobSlugLocale = key === "ar" ? "en" : "ar";
  const localized = opening.slugLocal?.[key]?.trim();
  if (localized) return localized;
  const otherLocalized = opening.slugLocal?.[otherKey]?.trim();
  if (otherLocalized) return otherLocalized;
  const shared = opening.slug?.trim();
  if (shared) return shared;
  const fromTitle = slugifyJobTitle(opening.title, key) || slugifyJobTitle(opening.title, otherKey);
  if (fromTitle) return fromTitle;
  return String(opening.id);
}

export function jobOpeningPath(slug: string): string {
  return `/careers/${encodeURIComponent(slug)}`;
}

export function jobOpeningMatchesSegment(opening: JobOpening, segment: string): boolean {
  const decoded = segment.trim();
  if (!decoded) return false;
  if (String(opening.id) === decoded) return true;
  if (opening.slug === decoded) return true;
  const local = opening.slugLocal;
  if (local?.ar === decoded || local?.en === decoded) return true;
  return false;
}

/** Merges AR/EN list responses so each opening has both locale slugs for URLs and hreflang. */
export function mergeJobOpeningsBilingual(
  arList: JobOpening[],
  enList: JobOpening[],
): JobOpening[] {
  const enById = new Map(enList.map((row) => [row.id, row]));
  return arList.map((arRow) => {
    const enRow = enById.get(arRow.id);
    const slugLocal = {
      ar: pickJobOpeningSlug(arRow, "ar"),
      en: enRow ? pickJobOpeningSlug(enRow, "en") : pickJobOpeningSlug(arRow, "en"),
    };
    return {
      ...arRow,
      slugLocal,
      slug: slugLocal.ar,
    };
  });
}

export function jobOpeningSlugVariants(opening: JobOpening): string[] {
  const values = [
    opening.slug,
    opening.slugLocal?.ar,
    opening.slugLocal?.en,
    String(opening.id),
  ];
  return [...new Set(values.filter((v): v is string => typeof v === "string" && v.trim().length > 0))].map(
    (v) => v.trim(),
  );
}
