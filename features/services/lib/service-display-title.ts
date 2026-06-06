import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Service } from "../types";
import { pickServiceSlug } from "./services-routes";

/** Title-case each word for English service labels (e.g. "seo services" → "Seo Services"). */
function titleCaseEnglish(text: string): string {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Plain text from rich HTML; uses image alt when the editor left only an image. */
export function plainTextFromServiceHtml(
  html: string | null | undefined,
  locale?: string,
): string {
  const text = plainTextFromHtml(html);
  if (text || !html) return text;

  const lang = locale?.startsWith("ar") ? "ar" : "en";
  const dataAlt = html.match(
    new RegExp(`data-alt-${lang}=["']([^"']*)["']`, "i"),
  );
  if (dataAlt?.[1]?.trim()) return dataAlt[1].trim();

  const otherLang = lang === "ar" ? "en" : "ar";
  const otherAlt = html.match(
    new RegExp(`data-alt-${otherLang}=["']([^"']*)["']`, "i"),
  );
  if (otherAlt?.[1]?.trim()) return otherAlt[1].trim();

  const alt = html.match(/\balt=["']([^"']*)["']/i);
  if (alt?.[1]?.trim()) return alt[1].trim();

  return "";
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type ServiceTitleFields = Pick<
  Service,
  "title" | "highlight_description" | "meta_title" | "slug" | "slug_local"
> & { image_alt?: string | null };

/** Resolves a short label for nav/footer/cards when API title is empty or image-only. */
export function pickServiceDisplayTitle(
  service: ServiceTitleFields,
  locale: string,
): string {
  const fields = [
    service.title,
    service.highlight_description,
    service.meta_title,
  ];

  for (const field of fields) {
    const text = plainTextFromServiceHtml(field, locale);
    if (text) return locale === "en" ? titleCaseEnglish(text) : text;
  }

  const imageAlt =
    typeof service.image_alt === "string" ? service.image_alt.trim() : "";
  if (imageAlt) return locale === "en" ? titleCaseEnglish(imageAlt) : imageAlt;

  const slug = pickServiceSlug(service, locale);
  if (slug) {
    const label = humanizeSlug(slug);
    return locale === "en" ? titleCaseEnglish(label) : label;
  }

  return "";
}

/** @deprecated Use pickServiceDisplayTitle(service, locale) */
export function serviceNavLabel(
  title: string | undefined,
  locale: string,
): string {
  const text = plainTextFromServiceHtml(title, locale);
  if (!text) return "";
  return locale === "en" ? titleCaseEnglish(text) : text;
}
