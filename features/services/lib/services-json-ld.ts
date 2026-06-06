import {
  buildCollectionPageSchemaGraph,
  buildBreadcrumbList,
  jsonLdGraph,
  type JsonLd,
} from "@/lib/seo/schema";
import type { Service } from "../types";

export function jsonLdScript(graph: JsonLd | JsonLd[]): string {
  const nodes = Array.isArray(graph) ? graph : [graph];
  return jsonLdGraph(nodes);
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return buildBreadcrumbList(items);
}

export function buildServiceCollectionJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  services: Service[];
  serviceUrl: (service: Service) => string;
}): JsonLd[] {
  return buildCollectionPageSchemaGraph({
    pageUrl: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: "ar",
    breadcrumbs: [],
    items: opts.services.map((service) => ({
      name: service.title.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      url: opts.serviceUrl(service),
    })),
    listIdSuffix: "services",
  });
}
