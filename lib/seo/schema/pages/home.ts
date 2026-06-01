import { organizationId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import { buildOfferCatalogFromServices } from "../global";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";

export type HomePageSchemaInput = {
  pageUrl: string;
  name: string;
  description: string;
  inLanguage: string;
  datePublished?: string;
  dateModified?: string;
  primaryImageUrl?: string;
  breadcrumbs: BreadcrumbItem[];
  services: { name: string; url: string }[];
  origin?: string;
};

export function buildHomePageSchemaGraph(input: HomePageSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const webPage: JsonLd = {
    "@type": "WebPage",
    "@id": pageWebPageId(input.pageUrl),
    url: input.pageUrl,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": websiteId(origin) },
    about: { "@id": organizationId(origin) },
    inLanguage: input.inLanguage,
  };
  if (input.datePublished) webPage.datePublished = input.datePublished;
  if (input.dateModified) webPage.dateModified = input.dateModified;
  if (input.primaryImageUrl) {
    webPage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: input.primaryImageUrl,
      width: "1200",
      height: "630",
    };
  }

  const nodes: JsonLd[] = [
    webPage,
    buildOfferCatalogFromServices(input.services, origin),
  ];
  if (input.breadcrumbs.length) {
    nodes.push(buildBreadcrumbList(input.breadcrumbs, input.pageUrl));
  }
  return nodes;
}

export function serializeHomePageSchema(input: HomePageSchemaInput): string {
  return jsonLdGraph(buildHomePageSchemaGraph(input));
}
