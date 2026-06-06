import { localePath } from "@/features/blogs/lib/blog-routes";
import type { CountryRouteCode } from "@/features/shared/lib/country-routes";
import { getCanonicalSiteUrl } from "@/lib/seo/site-url";
import type { Locale } from "next-intl";

export function absoluteUrlFromPath(path: string, origin?: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = (origin ?? getCanonicalSiteUrl()).replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function buildCanonicalUrl(
  locale: Locale,
  pathname: string,
  countryCode: CountryRouteCode = "SA",
  origin?: string,
): string {
  return absoluteUrlFromPath(localePath(locale, pathname, countryCode), origin);
}

/** Ensures path segments are encoded once for breadcrumb `item` URLs. */
export function encodePathSegmentsOnce(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const parts = pathname.split("/").filter(Boolean);
  return `/${parts.map((seg) => encodeURIComponent(decodeURIComponent(seg))).join("/")}`;
}

export function buildCanonicalUrlFromEncodedPath(
  locale: Locale,
  pathname: string,
  countryCode: CountryRouteCode = "SA",
  origin?: string,
): string {
  const withLocale = localePath(
    locale,
    encodePathSegmentsOnce(pathname),
    countryCode,
  );
  return absoluteUrlFromPath(withLocale, origin);
}

export function schemaMediaUrl(url: string | null | undefined, origin?: string): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return absoluteUrlFromPath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, origin);
}
