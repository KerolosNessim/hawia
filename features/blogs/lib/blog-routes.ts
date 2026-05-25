import { routing } from "@/i18n/routing";
import type { Locale } from "next-intl";

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

/** Prefixes pathname with locale when required (`as-needed` omits prefix for default locale). */
export function localePath(locale: Locale, pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === routing.defaultLocale) {
    return path;
  }
  return `/${locale}${path}`;
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

