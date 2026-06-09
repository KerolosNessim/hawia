import { localePath } from "@/features/blogs/lib/blog-routes";
import {
  parseCountryPath,
  stripLocalePrefixFromPath,
  type CountryRouteCode,
} from "@/features/shared/lib/country-routes";
import { routing } from "@/i18n/routing";
import type { Locale } from "next-intl";
import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  applyPaginationSeo,
  type PaginationSeoInput,
} from "./pagination-metadata";

/** Site-wide Referrer-Policy (emitted as `<meta name="referrer" …>` in `<head>`). */
export const SITE_REFERRER_POLICY =
  "strict-origin-when-cross-origin" as const;

export type LocalePathsMap = Partial<Record<Locale, string>>;

export type HreflangInput = {
  /** Locale-neutral path, e.g. `/about` or `/services/example`. */
  logicalPath: string;
  /** Per-locale paths when slugs differ (`slug_local`). Values are locale-prefixed paths without origin. */
  localePaths?: LocalePathsMap;
  /** Query string (`?page=2`) appended to every alternate URL. */
  query?: string;
  /** Route country (`/om/...` when `OM`). */
  countryCode?: CountryRouteCode;
};

/** Resolves an absolute URL for the current request (canonical, Open Graph, etc.). */
export async function getAbsoluteUrl(path: string): Promise<string> {
  if (path.startsWith("http")) return path;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return path;
  const proto = h.get("x-forwarded-proto") ?? "https";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${proto}://${host}${normalized}`;
}

export function splitPathAndQuery(path: string): { pathname: string; query: string } {
  const q = path.indexOf("?");
  if (q === -1) return { pathname: path, query: "" };
  return { pathname: path.slice(0, q), query: path.slice(q) };
}

/** Strips `/en` prefix for `localePrefix: 'as-needed'` (default locale has no prefix). */
export function stripLocalePrefix(pathname: string): string {
  return stripLocalePrefixFromPath(pathname);
}

/** Builds locale-specific paths when AR/EN slugs differ. */
export function localePathsForSlug(
  baseSegment: string,
  slugLocal?: { ar?: string; en?: string } | null,
  fallbackSlug?: string,
  countryCode: CountryRouteCode = "SA",
): LocalePathsMap | undefined {
  const base = baseSegment.replace(/\/$/, "");
  const ar = slugLocal?.ar?.trim();
  const en = slugLocal?.en?.trim();
  const fb = fallbackSlug?.trim();
  if (!ar && !en && !fb) return undefined;

  const paths: LocalePathsMap = {};
  for (const loc of routing.locales) {
    const slug = (loc === "ar" ? ar : en) || ar || en || fb;
    if (slug) {
      paths[loc] = localePath(loc, `${base}/${encodeURIComponent(slug)}`, countryCode);
    }
  }
  return Object.keys(paths).length ? paths : undefined;
}

/** Absolute URLs for `<link rel="alternate" hreflang="…">` (ar, en, x-default). */
export async function buildHreflangLanguages(
  input: HreflangInput,
): Promise<NonNullable<Metadata["alternates"]>["languages"]> {
  const query =
    input.query?.startsWith("?") ? input.query : input.query ? `?${input.query}` : "";
  const logical = input.logicalPath.startsWith("/")
    ? input.logicalPath
    : `/${input.logicalPath}`;

  const languages: Record<string, string> = {};

  const countryCode = input.countryCode ?? "SA";

  for (const loc of routing.locales) {
    const path =
      input.localePaths?.[loc] ?? localePath(loc, logical, countryCode);
    languages[loc] = await getAbsoluteUrl(`${path}${query}`);
  }

  const defaultLocale = routing.defaultLocale as Locale;
  const defaultPath =
    input.localePaths?.[defaultLocale] ??
    localePath(defaultLocale, logical, countryCode);
  languages["x-default"] = await getAbsoluteUrl(`${defaultPath}${query}`);

  return languages;
}

/** Merges hreflang alternates into existing metadata (blog/category pages with custom robots). */
export async function withHreflangAlternates(
  metadata: Metadata,
  input: HreflangInput & { pathname?: string; pagination?: PaginationSeoInput },
): Promise<Metadata> {
  const pathQuery = input.pathname ? splitPathAndQuery(input.pathname).query : "";
  const hreflangInput: HreflangInput = {
    logicalPath: input.logicalPath,
    localePaths: input.localePaths,
    query: input.query ?? (pathQuery || undefined),
    countryCode: input.countryCode,
  };
  const languages = await buildHreflangLanguages(hreflangInput);

  let result: Metadata = {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      languages,
    },
  };

  if (input.pagination) {
    return applyPaginationSeo(result, input.pagination);
  }

  const canonical =
    metadata.alternates?.canonical ??
    (input.pathname ? await getAbsoluteUrl(input.pathname) : undefined);

  return {
    ...result,
    alternates: {
      ...result.alternates,
      ...(canonical ? { canonical } : {}),
    },
  };
}

export type BuildPageMetadataInput = {
  locale: Locale;
  /** Locale-aware path without origin (may include `?query`). */
  pathname: string;
  /** Locale-neutral path when it cannot be derived from `pathname`. */
  logicalPath?: string;
  /** Route country when `pathname` includes `/om`. */
  countryCode?: CountryRouteCode;
  localePaths?: LocalePathsMap;
  title: string;
  description?: string | null;
  robots?: Metadata["robots"];
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
  pagination?: PaginationSeoInput;
};

/**
 * Builds Next.js `Metadata` so `<title>`, `<meta>`, `<link rel="canonical">`,
 * hreflang alternates, and robots tags are emitted in `<head>`.
 */
export async function buildPageMetadata(
  input: BuildPageMetadataInput,
): Promise<Metadata> {
  const canonical = await getAbsoluteUrl(input.pathname);
  const { pathname: pathOnly, query } = splitPathAndQuery(input.pathname);
  const { countryCode: routeCountry, pathname: withoutCountry } =
    parseCountryPath(pathOnly);
  const countryCode = input.countryCode ?? routeCountry;
  const logical =
    input.logicalPath ?? stripLocalePrefixFromPath(withoutCountry);
  const languages = await buildHreflangLanguages({
    logicalPath: logical,
    localePaths: input.localePaths,
    query: query || undefined,
    countryCode,
  });

  const title = input.title.trim() || "Howeyah";
  const description = input.description?.trim() || undefined;
  const ogLocale = input.locale === "ar" ? "ar_SA" : "en_US";

  const base: Metadata = {
    title,
    ...(description ? { description } : {}),
    referrer: SITE_REFERRER_POLICY,
    robots: input.robots ?? { index: true, follow: true },
    alternates: { canonical, languages },
    openGraph:
      input.openGraph ??
      ({
        title,
        description,
        locale: ogLocale,
        type: "website",
        url: canonical,
      } as Metadata["openGraph"]),
    ...(input.twitter ? { twitter: input.twitter } : {}),
  };

  if (input.pagination) {
    const paginated = await applyPaginationSeo(base, input.pagination);
    const paginatedCanonical = paginated.alternates?.canonical;
    if (paginatedCanonical && typeof paginatedCanonical === "string") {
      paginated.openGraph = {
        ...(typeof paginated.openGraph === "object" && paginated.openGraph
          ? paginated.openGraph
          : {}),
        url: paginatedCanonical,
      };
    }
    return paginated;
  }

  return base;
}

export function localePathname(
  locale: Locale,
  path: string,
  countryCode: CountryRouteCode = "SA",
): string {
  return localePath(locale, path, countryCode);
}

