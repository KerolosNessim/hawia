import { pageFaqId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";
import { faqItemToSchemaEntity, type FaqJsonLdInputItem } from "@/features/shared/lib/faq-json-ld";
import { dedupeFaqItems } from "@/features/shared/lib/strip-leading-duplicate-heading";

export type FaqPageSchemaInput = {
  pageUrl: string;
  name: string;
  description?: string;
  inLanguage: string;
  breadcrumbs: BreadcrumbItem[];
  faqItems: FaqJsonLdInputItem[];
  origin?: string;
};

export function buildFaqPageSchemaGraph(input: FaqPageSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);

  const mainEntity = dedupeFaqItems(input.faqItems)
    .map(faqItemToSchemaEntity)
    .filter((x): x is JsonLd => x != null);

  const webPage: JsonLd = {
    "@type": "WebPage",
    "@id": pageWebPageId(input.pageUrl),
    url: input.pageUrl,
    name: input.name,
    isPartOf: { "@id": websiteId(origin) },
    inLanguage: input.inLanguage,
    breadcrumb: { "@id": `${input.pageUrl.replace(/\/$/, "")}#breadcrumb` },
  };
  if (input.description) webPage.description = input.description;

  const nodes: JsonLd[] = [webPage, buildBreadcrumbList(input.breadcrumbs, input.pageUrl)];

  if (mainEntity.length) {
    nodes.push({
      "@type": "FAQPage",
      "@id": pageFaqId(input.pageUrl),
      name: input.name,
      mainEntity,
    });
  }

  return nodes;
}

export function serializeFaqPageSchema(input: FaqPageSchemaInput): string {
  return jsonLdGraph(buildFaqPageSchemaGraph(input));
}
