"use client";

import { localePath } from "@/features/blogs/lib/blog-routes";
import {
  getBreadcrumbTrailItems,
  humanizeSegment,
  isBreadcrumbSegment,
} from "@/features/shared/lib/breadcrumb-trail";
import { usePathname } from "@/i18n/navigation";
import { getSiteUrl } from "@/lib/seo/site-url";
import type { Locale } from "next-intl";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

export default function BreadcrumbJsonLd() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("seo.breadcrumb");
  const siteUrl = getSiteUrl();

  const jsonLd = useMemo(() => {
    const items = getBreadcrumbTrailItems(pathname, (segment) => {
      if (segment === "home") return t("home");
      if (isBreadcrumbSegment(segment)) return t(segment);
      return humanizeSegment(segment);
    });

    if (!items) {
      return null;
    }

    const itemListElement = items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.label,
      item: `${siteUrl}${localePath(locale as Locale, item.href)}`,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    };
  }, [locale, pathname, siteUrl, t]);

  if (!jsonLd) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
