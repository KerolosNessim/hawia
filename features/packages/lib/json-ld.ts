import {
  buildCollectionPageSchemaGraph,
  buildBreadcrumbList,
  buildPackageProductSchemaGraph,
  jsonLdGraph,
  type JsonLd,
} from "@/lib/seo/schema";
import type { PublicPackageCard, PublicPackageDetail } from "@/features/packages/services/packages-public-api";

export function jsonLdScript(graph: JsonLd | JsonLd[]): string {
  const nodes = Array.isArray(graph) ? graph : [graph];
  return jsonLdGraph(nodes);
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return buildBreadcrumbList(items);
}

export function buildPackageCollectionJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  packages: PublicPackageCard[];
  packageUrl: (pkg: PublicPackageCard) => string;
}): JsonLd[] {
  return buildCollectionPageSchemaGraph({
    pageUrl: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: "ar",
    breadcrumbs: [],
    items: opts.packages.map((pkg) => ({
      name: pkg.title,
      url: opts.packageUrl(pkg),
    })),
    listIdSuffix: "packages",
  });
}

export function buildPackageProductJsonLd(opts: {
  pkg: PublicPackageDetail;
  url: string;
  description: string;
  inLanguage: string;
}): JsonLd {
  const graphs = buildPackageProductSchemaGraph({
    pageUrl: opts.url,
    name: opts.pkg.title,
    description: opts.description,
    inLanguage: opts.inLanguage,
    imageUrl: opts.pkg.imageUrl,
    categoryTitle: opts.pkg.categoryTitle,
    features: opts.pkg.features,
    price: opts.pkg.price ? Number(opts.pkg.price) : null,
    currency: opts.pkg.currency,
    breadcrumbs: [],
  });
  return graphs.find((n) => n["@type"] === "Product") ?? graphs[0]!;
}
