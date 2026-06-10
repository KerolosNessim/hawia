import type { Locale } from "next-intl";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";
import { parseCountryPath } from "@/features/shared/lib/country-routes";
import type { BreadcrumbSegment } from "@/features/shared/lib/breadcrumb-trail";

type BreadcrumbKey = "home" | "om" | BreadcrumbSegment;

const LABELS: Record<Locale, Record<BreadcrumbKey, string>> = {
  en: enMessages.seo.breadcrumb as Record<BreadcrumbKey, string>,
  ar: arMessages.seo.breadcrumb as Record<BreadcrumbKey, string>,
};

/** Locale implied by the visible URL (`/en/om/...` → `en`, `/om/...` → `ar`). */
export function localeFromBrowserPath(pathname: string): Locale {
  const { pathname: routePath } = parseCountryPath(pathname);
  if (routePath === "/en" || routePath.startsWith("/en/")) return "en";
  return "ar";
}

export function breadcrumbLabel(
  locale: Locale,
  key: BreadcrumbKey,
): string {
  return LABELS[locale][key] ?? key;
}
