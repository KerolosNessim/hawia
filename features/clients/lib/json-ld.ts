import {
  buildCollectionPageSchemaGraph,
  buildClientWorkSchemaGraph,
  buildBreadcrumbList,
  jsonLdGraph,
  type JsonLd,
} from "@/lib/seo/schema";
import type { PublicClientCard } from "@/features/clients/services/clients-public-api";

export function jsonLdScript(graph: JsonLd | JsonLd[]): string {
  const nodes = Array.isArray(graph) ? graph : [graph];
  return jsonLdGraph(nodes);
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return buildBreadcrumbList(items);
}

export function buildClientsCollectionJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  clients: PublicClientCard[];
  clientUrl: (client: PublicClientCard) => string;
}): JsonLd[] {
  return buildCollectionPageSchemaGraph({
    pageUrl: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: "ar",
    breadcrumbs: [],
    items: opts.clients.map((client) => ({
      name: client.title,
      url: opts.clientUrl(client),
    })),
    listIdSuffix: "clients",
  });
}

export function buildClientCreativeWorkJsonLd(opts: {
  client: PublicClientCard;
  url: string;
  description: string;
  inLanguage: string;
}): JsonLd {
  const graphs = buildClientWorkSchemaGraph({
    pageUrl: opts.url,
    name: opts.client.title,
    description: opts.description,
    inLanguage: opts.inLanguage,
    imageUrls: opts.client.imageUrls,
    breadcrumbs: [],
  });
  return graphs.find((n) => n["@type"] === "CreativeWork") ?? graphs[0]!;
}
