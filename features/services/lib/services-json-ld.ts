import type { Service } from "../types";

type JsonLd = Record<string, unknown>;

export function jsonLdScript(graph: JsonLd | JsonLd[]): string {
  const payload = Array.isArray(graph)
    ? { "@context": "https://schema.org", "@graph": graph }
    : graph;
  return JSON.stringify(payload);
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildServiceCollectionJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  services: Service[];
  serviceUrl: (service: Service) => string;
}): JsonLd[] {
  const itemListId = `${opts.url}#services`;
  const itemList: JsonLd = {
    "@type": "ItemList",
    "@id": itemListId,
    name: opts.name,
    description: opts.description,
    numberOfItems: opts.services.length,
    itemListElement: opts.services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: opts.serviceUrl(service),
      name: service.title.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    })),
  };

  const collection: JsonLd = {
    "@type": "CollectionPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@type": "WebSite", name: "Howeyah" },
    mainEntity: { "@id": itemListId },
  };

  return [collection, itemList];
}
