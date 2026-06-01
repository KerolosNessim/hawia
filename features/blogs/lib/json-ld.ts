import {
  buildCollectionPageSchemaGraph,
  buildBreadcrumbList,
  jsonLdGraph,
  type JsonLd,
} from "@/lib/seo/schema";

export { blogExcerptPlain, categoryDescriptionPlain } from "./json-ld-blog-helpers";

export function jsonLdScript(graph: JsonLd | JsonLd[]): string {
  const nodes = Array.isArray(graph) ? graph : [graph];
  return jsonLdGraph(nodes);
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return buildBreadcrumbList(items);
}

export function buildBlogCategoryCollectionJsonLd(opts: {
  name: string;
  descriptionPlain: string;
  url: string;
  blogItems: { title: string; url: string; image?: string | null; datePublished?: string | null }[];
}): JsonLd[] {
  return buildCollectionPageSchemaGraph({
    pageUrl: opts.url,
    name: opts.name,
    description: opts.descriptionPlain,
    inLanguage: "ar",
    breadcrumbs: [],
    items: opts.blogItems.map((b) => ({
      name: b.title,
      url: b.url,
      image: b.image,
      datePublished: b.datePublished ?? undefined,
    })),
    listIdSuffix: "itemlist",
  });
}

export { buildBlogPostSchemaGraph as buildBlogPostingJsonLd } from "@/lib/seo/schema";
