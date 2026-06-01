import { organizationId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";

export type StaticPageSchemaType = "AboutPage" | "ContactPage" | "WebPage" | "CollectionPage";

export type StaticPageSchemaInput = {
  pageType?: StaticPageSchemaType;
  pageUrl: string;
  name: string;
  description: string;
  inLanguage: string;
  breadcrumbs: BreadcrumbItem[];
  mainEntityOrganization?: boolean;
  origin?: string;
};

export function buildStaticPageSchemaGraph(input: StaticPageSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const pageType = input.pageType ?? "WebPage";

  const webPage: JsonLd = {
    "@type": pageType,
    "@id": pageWebPageId(input.pageUrl),
    url: input.pageUrl,
    name: input.name,
    description: input.description,
    isPartOf: { "@id": websiteId(origin) },
    inLanguage: input.inLanguage,
    breadcrumb: { "@id": `${input.pageUrl.replace(/\/$/, "")}#breadcrumb` },
  };

  if (pageType === "AboutPage" || pageType === "ContactPage") {
    webPage.about = { "@id": organizationId(origin) };
  }
  if (input.mainEntityOrganization) {
    webPage.mainEntity = { "@id": organizationId(origin) };
  }

  return [webPage, buildBreadcrumbList(input.breadcrumbs, input.pageUrl)];
}

export function serializeStaticPageSchema(input: StaticPageSchemaInput): string {
  return jsonLdGraph(buildStaticPageSchemaGraph(input));
}
