import { organizationId, pageBlogId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";

export type BlogIndexSchemaInput = {
  pageUrl: string;
  name: string;
  description: string;
  blogName: string;
  inLanguage: string;
  breadcrumbs: BreadcrumbItem[];
  origin?: string;
};

export function buildBlogIndexSchemaGraph(input: BlogIndexSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const collection: JsonLd = {
    "@type": "CollectionPage",
    "@id": pageWebPageId(input.pageUrl),
    url: input.pageUrl,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": websiteId(origin) },
    inLanguage: input.inLanguage,
    breadcrumb: { "@id": `${input.pageUrl.replace(/\/$/, "")}#breadcrumb` },
  };

  const blog: JsonLd = {
    "@type": "Blog",
    "@id": pageBlogId(input.pageUrl),
    name: input.blogName,
    url: input.pageUrl,
    publisher: { "@id": organizationId(origin) },
    inLanguage: input.inLanguage,
  };

  return [
    collection,
    blog,
    buildBreadcrumbList(input.breadcrumbs, input.pageUrl),
  ];
}

export function serializeBlogIndexSchema(input: BlogIndexSchemaInput): string {
  return jsonLdGraph(buildBlogIndexSchemaGraph(input));
}
