import {
  type CountryRouteCode,
  withCountryPrefix,
} from "@/features/shared/lib/country-routes";
import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { routing } from "@/i18n/routing";
import type { Locale } from "next-intl";

export type BlogSlugFields = {
  slug: string;
  slug_local?: { ar?: string; en?: string };
};

export function pickBlogSlug(blog: BlogSlugFields, locale: string): string {
  const key = locale === "ar" ? "ar" : "en";
  const local = blog.slug_local?.[key] ?? blog.slug_local?.ar ?? blog.slug_local?.en;
  return (local ?? blog.slug ?? "").trim();
}

export function blogSlugVariants(blog: BlogSlugFields): string[] {
  return [blog.slug, blog.slug_local?.ar, blog.slug_local?.en]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => decodePathSegment(value.trim()));
}

/** Whether a URL segment matches a blog's canonical or localized slugs. */
export function blogMatchesSlugSegment(blog: BlogSlugFields, segment: string): boolean {
  const decoded = decodePathSegment(segment);
  return blogSlugVariants(blog).some((variant) => {
    if (variant === decoded) return true;
    try {
      return variant.normalize("NFKC") === decoded.normalize("NFKC");
    } catch {
      return false;
    }
  });
}

/** Single-segment slugs under `/blogs/{slug}` handled by other routes (e.g. `/blogs/tag/...`). */
export const RESERVED_BLOG_SLUGS = new Set(["tag"]);

/** @deprecated Use {@link RESERVED_BLOG_SLUGS} */
export const RESERVED_BLOG_CATEGORY_SLUGS = RESERVED_BLOG_SLUGS;

/** Path without locale prefix (for `@/i18n/navigation` `Link` and pathname helpers). */
export function blogPostPath(slug: string): string {
  return `/blogs/${encodeURIComponent(slug)}`;
}

export function blogCategoryPath(slug: string): string {
  return `/blogs/${encodeURIComponent(slug)}`;
}

/** Articles filtered by CMS tag label. */
export function blogTagPath(tag: string): string {
  return `/blogs/tag/${encodeURIComponent(tag)}`;
}

export function blogTagHref(locale: Locale, tag: string, page: number): string {
  const p = new URLSearchParams();
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  const base = localePath(locale, blogTagPath(tag));
  return q ? `${base}?${q}` : base;
}

/** Prefixes pathname with locale and optional Oman route segment (`/om`, `/en/om`, …). */
export function localePath(
  locale: Locale,
  pathname: string,
  countryCode: CountryRouteCode = "SA",
): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const localized =
    locale === routing.defaultLocale
      ? path
      : `/${locale}${path === "/" ? "" : path}`;
  return withCountryPrefix(countryCode, localized);
}

export function blogPostHref(locale: Locale, slug: string): string {
  return localePath(locale, blogPostPath(slug));
}

export function blogIndexHref(locale: Locale, page: number, opts?: { search?: string }): string {
  const p = new URLSearchParams();
  const s = opts?.search?.trim();
  if (s) p.set("search", s);
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  const base = localePath(locale, "/blogs");
  return q ? `${base}?${q}` : base;
}

export function blogCategoryHref(
  locale: Locale,
  categorySlug: string,
  page: number,
  opts?: { search?: string },
): string {
  const p = new URLSearchParams();
  const s = opts?.search?.trim();
  if (s) p.set("search", s);
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  const base = localePath(locale, `/blogs/${encodeURIComponent(categorySlug)}`);
  return q ? `${base}?${q}` : base;
}

export function blogPostAbsoluteUrl(origin: string, locale: Locale, slug: string): string {
  const path = localePath(locale, blogPostPath(slug));
  return `${origin.replace(/\/$/, "")}${path}`;
}

