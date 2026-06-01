import type { BreadcrumbItem, JsonLd } from "./types";
import { pageBreadcrumbId } from "./ids";

export function jsonLdGraph(nodes: JsonLd[]): string {
  const graph = nodes.filter((n) => Object.keys(n).length > 0);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
}

export function buildBreadcrumbList(
  items: BreadcrumbItem[],
  pageUrl?: string,
): JsonLd {
  const breadcrumb: JsonLd = {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  if (pageUrl) {
    breadcrumb["@id"] = pageBreadcrumbId(pageUrl);
  }
  return breadcrumb;
}
