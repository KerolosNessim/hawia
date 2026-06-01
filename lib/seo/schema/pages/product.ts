import { organizationId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import { pageWebPageId } from "../ids";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";

export type PackageProductSchemaInput = {
  pageUrl: string;
  name: string;
  description: string;
  inLanguage: string;
  imageUrl?: string | null;
  categoryTitle?: string | null;
  features?: { title: string; isIncluded: boolean }[];
  price?: number | null;
  currency?: string | null;
  breadcrumbs: BreadcrumbItem[];
  origin?: string;
};

export function buildPackageProductSchemaGraph(input: PackageProductSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const product: JsonLd = {
    "@type": "Product",
    "@id": `${input.pageUrl.replace(/\/$/, "")}#package`,
    url: input.pageUrl,
    name: input.name,
    description: input.description,
    inLanguage: input.inLanguage,
    brand: { "@type": "Brand", name: "Howeyah" },
    isPartOf: { "@id": websiteId(origin) },
    manufacturer: { "@id": organizationId(origin) },
  };

  if (input.imageUrl) product.image = [input.imageUrl];
  if (input.categoryTitle) product.category = input.categoryTitle;
  if (input.features?.length) {
    product.additionalProperty = input.features.map((f) => ({
      "@type": "PropertyValue",
      name: f.title,
      value: f.isIncluded ? "Included" : "Not included",
    }));
  }

  const numericPrice = input.price != null && Number.isFinite(input.price) ? input.price : null;
  if (numericPrice != null) {
    const offer: JsonLd = {
      "@type": "Offer",
      price: numericPrice,
      availability: "https://schema.org/InStock",
      url: input.pageUrl,
      seller: { "@id": organizationId(origin) },
    };
    if (input.currency && /^[A-Z]{3}$/.test(input.currency.trim())) {
      offer.priceCurrency = input.currency.trim();
    }
    product.offers = offer;
  }

  const webPage: JsonLd = {
    "@type": "WebPage",
    "@id": pageWebPageId(input.pageUrl),
    url: input.pageUrl,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": websiteId(origin) },
    mainEntity: { "@id": `${input.pageUrl.replace(/\/$/, "")}#package` },
    inLanguage: input.inLanguage,
  };

  return [
    webPage,
    product,
    buildBreadcrumbList(input.breadcrumbs, input.pageUrl),
  ];
}

export function serializePackageProductSchema(input: PackageProductSchemaInput): string {
  return jsonLdGraph(buildPackageProductSchemaGraph(input));
}
