export const BREADCRUMB_SEGMENTS = [
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

export type BreadcrumbSegment = (typeof BREADCRUMB_SEGMENTS)[number];

const BREADCRUMB_SEGMENT_SET = new Set<string>(BREADCRUMB_SEGMENTS);

export function isBreadcrumbSegment(segment: string): segment is BreadcrumbSegment {
  return BREADCRUMB_SEGMENT_SET.has(segment);
}

export function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export type BreadcrumbTrailItem = {
  href: string;
  label: string;
};

export function getBreadcrumbTrailItems(
  pathname: string,
  resolveLabel: (segment: string) => string,
): BreadcrumbTrailItem[] | null {
  const segments =
    !pathname || pathname === "/" ? [] : pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const items: BreadcrumbTrailItem[] = [{ href: "/", label: resolveLabel("home") }];

  let acc = "";
  for (const segment of segments) {
    acc += `/${segment}`;
    items.push({ href: acc, label: resolveLabel(segment) });
  }

  return items;
}
