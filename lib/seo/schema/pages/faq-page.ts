import { pageFaqId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";
import type { FaqJsonLdInputItem } from "@/features/shared/lib/faq-json-ld";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";

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

  const mainEntity = input.faqItems
    .map((item) => {
      const name = plainTextFromHtml(item.question);
      const text = plainTextFromHtml(item.answer);
      if (!name || !text) return null;
      return {
        "@type": "Question",
        name,
        acceptedAnswer: { "@type": "Answer", text },
      };
    })
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
