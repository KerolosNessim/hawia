import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { organizationId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import { schemaMediaUrl } from "../urls";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";

function pageJobPostingId(pageUrl: string): string {
  return `${pageUrl.replace(/\/$/, "")}#jobposting`;
}

function mapEmploymentType(jobType: string | null | undefined): string | undefined {
  if (!jobType?.trim()) return undefined;
  const normalized = jobType.trim().toLowerCase();
  if (normalized.includes("full")) return "FULL_TIME";
  if (normalized.includes("part")) return "PART_TIME";
  if (normalized.includes("contract")) return "CONTRACTOR";
  if (normalized.includes("temp")) return "TEMPORARY";
  if (normalized.includes("intern")) return "INTERN";
  if (normalized.includes("volunteer")) return "VOLUNTEER";
  return "OTHER";
}

export type JobPostingSchemaInput = {
  pageUrl: string;
  title: string;
  description: string;
  employmentType?: string | null;
  inLanguage: string;
  imageUrl?: string | null;
  datePosted?: string | null;
  validThrough?: string | null;
  breadcrumbs: BreadcrumbItem[];
  origin?: string;
};

export function buildJobPostingSchemaGraph(input: JobPostingSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const jobId = pageJobPostingId(input.pageUrl);
  const descriptionPlain = plainTextFromHtml(input.description).slice(0, 5000);
  const titlePlain = plainTextFromHtml(input.title).trim();

  const jobPosting: JsonLd = {
    "@type": "JobPosting",
    "@id": jobId,
    title: titlePlain,
    description: descriptionPlain,
    url: input.pageUrl,
    hiringOrganization: { "@id": organizationId(origin) },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "SA",
      },
    },
    directApply: true,
  };

  const employmentType = mapEmploymentType(input.employmentType);
  if (employmentType) jobPosting.employmentType = employmentType;

  if (input.datePosted) jobPosting.datePosted = input.datePosted;
  if (input.validThrough) jobPosting.validThrough = input.validThrough;

  const image = input.imageUrl ? schemaMediaUrl(input.imageUrl, origin) : undefined;
  if (image) jobPosting.image = image;

  const webPage: JsonLd = {
    "@type": "WebPage",
    "@id": pageWebPageId(input.pageUrl),
    url: input.pageUrl,
    name: titlePlain,
    description: descriptionPlain.slice(0, 320),
    isPartOf: { "@id": websiteId(origin) },
    mainEntity: { "@id": jobId },
    inLanguage: input.inLanguage,
    breadcrumb: { "@id": `${input.pageUrl.replace(/\/$/, "")}#breadcrumb` },
  };

  return [webPage, jobPosting, buildBreadcrumbList(input.breadcrumbs, input.pageUrl)];
}

export function serializeJobPostingSchema(input: JobPostingSchemaInput): string {
  return jsonLdGraph(buildJobPostingSchemaGraph(input));
}
