import type { Locale } from "next-intl";

/** Segments reserved under `/blogs/*` so they never map to a category slug route. */
export const RESERVED_BLOG_CATEGORY_SLUGS = new Set(["blog"]);

export function blogPostPath(slug: string): string {
  return `/blogs/blog/${encodeURIComponent(slug)}`;
}

export function blogCategoryPath(slug: string): string {
  return `/blogs/${encodeURIComponent(slug)}`;
}

export function blogIndexHref(locale: Locale, page: number, opts?: { search?: string }): string {
  const p = new URLSearchParams();
  const s = opts?.search?.trim();
  if (s) p.set("search", s);
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  return q ? `/${locale}/blogs?${q}` : `/${locale}/blogs`;
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
  const base = `/${locale}/blogs/${encodeURIComponent(categorySlug)}`;
  return q ? `${base}?${q}` : base;
}

export function blogPostAbsoluteUrl(origin: string, locale: Locale, slug: string): string {
  const path = blogPostPath(slug);
  return `${origin.replace(/\/$/, "")}/${locale}${path}`;
}
