import type { PublicPackageCard, PublicPackageDetail } from "@/features/packages/services/packages-public-api";

type JsonLd = Record<string, unknown>;

export function jsonLdScript(graph: JsonLd | JsonLd[]): string {
  const payload = Array.isArray(graph) ? { "@context": "https://schema.org", "@graph": graph } : graph;
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

export function buildPackageCollectionJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  packages: PublicPackageCard[];
  packageUrl: (pkg: PublicPackageCard) => string;
}): JsonLd[] {
  const itemListId = `${opts.url}#packages`;
  const itemList: JsonLd = {
    "@type": "ItemList",
    "@id": itemListId,
    name: opts.name,
    description: opts.description,
    numberOfItems: opts.packages.length,
    itemListElement: opts.packages.map((pkg, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: opts.packageUrl(pkg),
      name: pkg.title,
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

export function buildPackageProductJsonLd(opts: {
  pkg: PublicPackageDetail;
  url: string;
  description: string;
  inLanguage: string;
}): JsonLd {
  const product: JsonLd = {
    "@type": "Product",
    "@id": `${opts.url}#package`,
    url: opts.url,
    name: opts.pkg.title,
    description: opts.description,
    inLanguage: opts.inLanguage,
    brand: { "@type": "Brand", name: "Howeyah" },
  };

  if (opts.pkg.imageUrl) product.image = [opts.pkg.imageUrl];
  if (opts.pkg.categoryTitle) product.category = opts.pkg.categoryTitle;
  if (opts.pkg.features.length) {
    product.additionalProperty = opts.pkg.features.map((feature) => ({
      "@type": "PropertyValue",
      name: feature.title,
      value: feature.isIncluded ? "Included" : "Not included",
    }));
  }

  const numericPrice = opts.pkg.price ? Number(opts.pkg.price) : null;
  if (numericPrice != null && Number.isFinite(numericPrice)) {
    const offer: JsonLd = {
      "@type": "Offer",
      price: numericPrice,
      availability: "https://schema.org/InStock",
      url: opts.url,
    };
    if (opts.pkg.currency && /^[A-Z]{3}$/.test(opts.pkg.currency.trim())) {
      offer.priceCurrency = opts.pkg.currency.trim();
    }
    product.offers = offer;
  }

  return product;
}
