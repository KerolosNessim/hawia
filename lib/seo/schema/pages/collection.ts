import { organizationId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";

export type CollectionListItem = {
  name: string;
  url: string;
  image?: string | null;
  datePublished?: string | null;
};

export type CollectionPageSchemaInput = {
  pageUrl: string;
  name: string;
  description: string;
  inLanguage: string;
  breadcrumbs: BreadcrumbItem[];
  items: CollectionListItem[];
  listIdSuffix?: string;
  pageType?: "CollectionPage" | "WebPage";
  origin?: string;
};

export function buildCollectionPageSchemaGraph(input: CollectionPageSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const listId = `${input.pageUrl.replace(/\/$/, "")}#${input.listIdSuffix ?? "itemlist"}`;
  const pageType = input.pageType ?? "CollectionPage";

  const itemList: JsonLd = {
    "@type": "ItemList",
    "@id": listId,
    name: input.name,
    description: input.description,
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, index) => {
      const entry: JsonLd = {
        "@type": "ListItem",
        position: index + 1,
        url: item.url,
        name: item.name,
      };
      if (item.datePublished) entry.datePublished = item.datePublished;
      return entry;
    }),
  };

  const collection: JsonLd = {
    "@type": pageType,
    "@id": pageWebPageId(input.pageUrl),
    url: input.pageUrl,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": websiteId(origin) },
    inLanguage: input.inLanguage,
    mainEntity: { "@id": listId },
  };

  if (input.breadcrumbs.length) {
    collection.breadcrumb = { "@id": `${input.pageUrl.replace(/\/$/, "")}#breadcrumb` };
  }

  const nodes: JsonLd[] = [collection, itemList];
  if (input.breadcrumbs.length) {
    nodes.push(buildBreadcrumbList(input.breadcrumbs, input.pageUrl));
  }
  return nodes;
}

export function serializeCollectionPageSchema(input: CollectionPageSchemaInput): string {
  return jsonLdGraph(buildCollectionPageSchemaGraph(input));
}
