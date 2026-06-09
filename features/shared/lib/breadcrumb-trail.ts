import { decodePathSegment } from "@/features/shared/lib/decode-path-segment";
import { parseCountryPath } from "@/features/shared/lib/country-routes";

export const BREADCRUMB_SEGMENTS = [
  "about",
  "ai-services",
  "blog",
  "blogs",
  "clients",
  "contact-us",
  "courses",
  "faq",
  "login",
  "packages",
  "categories",
  "register",
  "services",
] as const;

export type BreadcrumbSegment = (typeof BREADCRUMB_SEGMENTS)[number];

const BREADCRUMB_SEGMENT_SET = new Set<string>(BREADCRUMB_SEGMENTS);

export function isBreadcrumbSegment(segment: string): segment is BreadcrumbSegment {
  return BREADCRUMB_SEGMENT_SET.has(segment.toLowerCase());
}

export function humanizeSegment(segment: string): string {
  const decoded = decodePathSegment(segment);

  // Slugs with spaces or non-ASCII (e.g. Arabic titles) — show decoded text as-is
  if (/[^\u0000-\u007F]/.test(decoded) || /\s/.test(decoded)) {
    return decoded;
  }

  return decoded
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export type BreadcrumbTrailItem = {
  href: string;
  label: string;
};

type BreadcrumbTranslate = (key: "home" | "om" | BreadcrumbSegment) => string;

const COUNTRY_ROUTE_LABEL_KEYS = {
  om: "om",
} as const;

function isCountryRouteSegment(segment: string): segment is keyof typeof COUNTRY_ROUTE_LABEL_KEYS {
  return segment in COUNTRY_ROUTE_LABEL_KEYS;
}

/** Single resolver for UI breadcrumbs and layout JSON-LD. */
export function resolveBreadcrumbSegmentLabel(
  segment: string,
  translate: BreadcrumbTranslate,
): string {
  if (segment === "home") return translate("home");
  const normalized = segment.toLowerCase();
  if (isCountryRouteSegment(normalized)) {
    return translate(COUNTRY_ROUTE_LABEL_KEYS[normalized]);
  }
  if (isBreadcrumbSegment(normalized)) return translate(normalized);
  return humanizeSegment(segment);
}

function splitPathname(pathname: string): string[] {
  if (!pathname || pathname === "/") return [];
  return pathname.split("/").filter(Boolean).map(decodePathSegment);
}

export function getBreadcrumbTrailItems(
  pathname: string,
  resolveLabel: (segment: string) => string,
): BreadcrumbTrailItem[] | null {
  const { countryCode, pathname: routePath } = parseCountryPath(pathname);
  const isEnglishOman =
    countryCode === "OM" && (routePath === "/en" || routePath.startsWith("/en/"));
  const pathForSegments =
    isEnglishOman && routePath !== "/en"
      ? routePath.slice(3) || "/"
      : isEnglishOman
        ? "/"
        : routePath;
  const segments = splitPathname(pathForSegments);

  if (segments.length === 0 && countryCode === "SA") {
    return null;
  }

  const items: BreadcrumbTrailItem[] = [{ href: "/", label: resolveLabel("home") }];
  if (countryCode === "OM") {
    items.push({
      href: isEnglishOman ? "/en/om" : "/om",
      label: resolveLabel("om"),
    });
  }

  let acc = "";
  for (const segment of segments) {
    const decoded = decodeURIComponent(segment);
    acc += `/${encodeURIComponent(decoded)}`;
    items.push({ href: acc, label: resolveLabel(segment) });
  }

  return items;
}
