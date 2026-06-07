import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { ServiceCountry } from "@/features/services/types";
import { organizationId, pageFaqId, pageServiceId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";
import { faqItemToSchemaEntity, type FaqJsonLdInputItem } from "@/features/shared/lib/faq-json-ld";
import { dedupeFaqItems } from "@/features/shared/lib/strip-leading-duplicate-heading";

function countriesToAreaServed(countries: ServiceCountry[]): JsonLd[] {
  return countries
    .map((c) => {
      const name =
        typeof c.name === "string"
          ? c.name
          : c.name?.ar?.trim() || c.name?.en?.trim();
      if (!name) return null;
      return { "@type": "Country", name };
    })
    .filter((x): x is JsonLd => x != null);
}

export type ServicePageSchemaInput = {
  pageUrl: string;
  name: string;
  description: string;
  serviceType?: string;
  inLanguage: string;
  breadcrumbs: BreadcrumbItem[];
  areaServed?: ServiceCountry[];
  faqItems?: FaqJsonLdInputItem[];
  faqName?: string;
  origin?: string;
};

export function buildServicePageSchemaGraph(input: ServicePageSchemaInput): JsonLd[] {
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
    breadcrumb: { "@id": `${input.pageUrl.replace(/\/$/, "")}#breadcrumb` },
  };

  const service: JsonLd = {
    "@type": "Service",
    "@id": pageServiceId(input.pageUrl),
    name: input.name,
    description: input.description,
    serviceType: input.serviceType ?? input.name,
    provider: { "@id": organizationId(origin) },
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Small to medium businesses, E-commerce stores",
    },
  };

  const areaServed = input.areaServed?.length
    ? countriesToAreaServed(input.areaServed)
    : undefined;
  if (areaServed?.length) service.areaServed = areaServed;

  const nodes: JsonLd[] = [
    webPage,
    service,
    buildBreadcrumbList(input.breadcrumbs, input.pageUrl),
  ];

  if (input.faqItems?.length) {
    const mainEntity = dedupeFaqItems(input.faqItems)
      .map(faqItemToSchemaEntity)
      .filter((x): x is JsonLd => x != null);

    if (mainEntity.length) {
      const faq: JsonLd = {
        "@type": "FAQPage",
        "@id": pageFaqId(input.pageUrl),
        mainEntity,
      };
      if (input.faqName) faq.name = input.faqName;
      nodes.push(faq);
    }
  }

  return nodes;
}

export function serializeServicePageSchema(input: ServicePageSchemaInput): string {
  return jsonLdGraph(buildServicePageSchemaGraph(input));
}
