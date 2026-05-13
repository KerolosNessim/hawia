import type { PublicClientCard } from "@/features/clients/services/clients-public-api";

type JsonLd = Record<string, unknown>;

export function jsonLdScript(graph: JsonLd | JsonLd[]): string {
  return JSON.stringify(Array.isArray(graph) ? { "@context": "https://schema.org", "@graph": graph } : graph);
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

export function buildClientsCollectionJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  clients: PublicClientCard[];
  clientUrl: (client: PublicClientCard) => string;
}): JsonLd[] {
  const itemListId = `${opts.url}#clients`;
  return [
    {
      "@type": "CollectionPage",
      "@id": `${opts.url}#webpage`,
      url: opts.url,
      name: opts.name,
      description: opts.description,
      isPartOf: { "@type": "WebSite", name: "Howeyah" },
      mainEntity: { "@id": itemListId },
    },
    {
      "@type": "ItemList",
      "@id": itemListId,
      name: opts.name,
      description: opts.description,
      numberOfItems: opts.clients.length,
      itemListElement: opts.clients.map((client, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: opts.clientUrl(client),
        name: client.title,
      })),
    },
  ];
}

export function buildClientCreativeWorkJsonLd(opts: {
  client: PublicClientCard;
  url: string;
  description: string;
  inLanguage: string;
}): JsonLd {
  const creativeWork: JsonLd = {
    "@type": "CreativeWork",
    "@id": `${opts.url}#client-work`,
    url: opts.url,
    name: opts.client.title,
    description: opts.description,
    inLanguage: opts.inLanguage,
    creator: { "@type": "Organization", name: "Howeyah" },
    provider: { "@type": "Organization", name: "Howeyah" },
  };

  if (opts.client.imageUrls.length) {
    creativeWork.image = opts.client.imageUrls;
  }

  return creativeWork;
}
