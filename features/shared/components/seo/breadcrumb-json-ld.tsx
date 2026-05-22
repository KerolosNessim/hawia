"use client";

import { localePath } from "@/features/blogs/lib/blog-routes";
import { usePathname } from "@/i18n/navigation";
import { getSiteUrl } from "@/lib/seo/site-url";
import type { Locale } from "next-intl";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

const BREADCRUMB_SEGMENTS = [
  "about",
  "blog",
  "blogs",
  "clients",
  "contact-us",
  "courses",
  "faq",
  "login",
  "packages",
  "register",
  "services",
] as const;

type BreadcrumbSegment = (typeof BREADCRUMB_SEGMENTS)[number];

const BREADCRUMB_SEGMENT_SET = new Set<string>(BREADCRUMB_SEGMENTS);

function isBreadcrumbSegment(s: string): s is BreadcrumbSegment {
  return BREADCRUMB_SEGMENT_SET.has(s);
}

function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function BreadcrumbJsonLd() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("seo.breadcrumb");
  const siteUrl = getSiteUrl();

  const jsonLd = useMemo(() => {
    const segments =
      !pathname || pathname === "/"
        ? []
        : pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      return null;
    }

    const itemListElement: Array<{
      "@type": "ListItem";
      position: number;
      name: string;
      item: string;
    }> = [
      {
        "@type": "ListItem",
        position: 1,
        name: t("home"),
        item: `${siteUrl}${localePath(locale as Locale, "/")}`,
      },
    ];

    let acc = "";
    segments.forEach((segment, index) => {
      acc += `/${segment}`;
      const name = isBreadcrumbSegment(segment)
        ? t(segment)
        : humanizeSegment(segment);

      itemListElement.push({
        "@type": "ListItem",
        position: index + 2,
        name,
        item: `${siteUrl}${localePath(locale as Locale, acc)}`,
      });
    });

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
