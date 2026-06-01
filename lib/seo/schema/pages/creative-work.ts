import { organizationId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import { pageWebPageId } from "../ids";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";

export type ClientWorkSchemaInput = {
  pageUrl: string;
  name: string;
  description: string;
  inLanguage: string;
  imageUrls?: string[];
  breadcrumbs: BreadcrumbItem[];
  origin?: string;
};

export function buildClientWorkSchemaGraph(input: ClientWorkSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const workId = `${input.pageUrl.replace(/\/$/, "")}#client-work`;

  const creativeWork: JsonLd = {
    "@type": "CreativeWork",
    "@id": workId,
    url: input.pageUrl,
    name: input.name,
    description: input.description,
    inLanguage: input.inLanguage,
    creator: { "@id": organizationId(origin) },
    provider: { "@id": organizationId(origin) },
  };
  if (input.imageUrls?.length) creativeWork.image = input.imageUrls;

  const webPage: JsonLd = {
    "@type": "WebPage",
    "@id": pageWebPageId(input.pageUrl),
    url: input.pageUrl,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": websiteId(origin) },
    mainEntity: { "@id": workId },
    inLanguage: input.inLanguage,
  };

  return [
    webPage,
    creativeWork,
    buildBreadcrumbList(input.breadcrumbs, input.pageUrl),
  ];
}

export function serializeClientWorkSchema(input: ClientWorkSchemaInput): string {
  return jsonLdGraph(buildClientWorkSchemaGraph(input));
}
