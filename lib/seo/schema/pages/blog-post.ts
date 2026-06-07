import { organizationId, pageArticleId, pageWebPageId, websiteId } from "../ids";
import { buildBreadcrumbList, jsonLdGraph } from "../graph";
import { toSchemaDate, countWordsFromHtml } from "../format";
import type { BreadcrumbItem, JsonLd } from "../types";
import { schemaOrigin } from "../ids";
import { absoluteUrlFromPath } from "../urls";
import { faqItemToSchemaEntity, type FaqJsonLdInputItem } from "@/features/shared/lib/faq-json-ld";
import { dedupeFaqItems } from "@/features/shared/lib/strip-leading-duplicate-heading";

export type BlogPostSchemaInput = {
  pageUrl: string;
  headline: string;
  description: string;
  inLanguage: string;
  datePublished?: string | null;
  dateModified?: string | null;
  imageUrls?: string[];
  authorName: string;
  authorUrl?: string;
  authorImage?: string;
  keywords?: string[];
  articleSection?: string | null;
  contentHtml?: string;
  tagNames?: string[];
  breadcrumbs: BreadcrumbItem[];
  faqItems?: FaqJsonLdInputItem[];
  faqName?: string;
  origin?: string;
};

export function buildBlogPostSchemaGraph(input: BlogPostSchemaInput): JsonLd[] {
  const origin = schemaOrigin(input.origin);
  const pageId = pageWebPageId(input.pageUrl);

  const webPage: JsonLd = {
    "@type": "WebPage",
    "@id": pageId,
    url: input.pageUrl,
    isPartOf: { "@id": websiteId(origin) },
    inLanguage: input.inLanguage,
    breadcrumb: { "@id": `${input.pageUrl.replace(/\/$/, "")}#breadcrumb` },
  };

  const primaryImage = input.imageUrls?.[0];
  if (primaryImage) {
    webPage.primaryImageOfPage = {
      "@type": "ImageObject",
      url: primaryImage,
    };
  }

  const author: JsonLd = {
    "@type": "Person",
    name: input.authorName,
  };
  if (input.authorUrl) {
    author["@id"] = `${input.authorUrl.replace(/\/$/, "")}#person`;
    author.url = input.authorUrl;
  }
  if (input.authorImage) author.image = input.authorImage;

  const article: JsonLd = {
    "@type": "BlogPosting",
    "@id": pageArticleId(input.pageUrl),
    mainEntityOfPage: { "@id": pageId },
    headline: input.headline,
    description: input.description,
    inLanguage: input.inLanguage,
    author,
    publisher: { "@id": organizationId(origin) },
    isAccessibleForFree: true,
  };

  const published = toSchemaDate(input.datePublished ?? undefined);
  const modified = toSchemaDate(input.dateModified ?? input.datePublished ?? undefined);
  if (published) article.datePublished = published;
  if (modified) article.dateModified = modified;

  if (input.imageUrls?.length) article.image = input.imageUrls;
  if (input.keywords?.length) article.keywords = input.keywords;
  if (input.articleSection) article.articleSection = input.articleSection;

  const wordCount = input.contentHtml ? countWordsFromHtml(input.contentHtml) : 0;
  if (wordCount > 0) article.wordCount = String(wordCount);

  const aboutTags = (input.tagNames ?? []).filter(Boolean);
  if (aboutTags.length) {
    article.about = aboutTags.map((name) => ({ "@type": "Thing", name }));
  }

  const nodes: JsonLd[] = [
    webPage,
    article,
    buildBreadcrumbList(input.breadcrumbs, input.pageUrl),
  ];

  if (input.faqItems?.length) {
    const mainEntity = dedupeFaqItems(input.faqItems)
      .map(faqItemToSchemaEntity)
      .filter((x): x is JsonLd => x != null);

    if (mainEntity.length) {
      nodes.push({
        "@type": "FAQPage",
        "@id": `${input.pageUrl.replace(/\/$/, "")}#faq`,
        mainEntity,
        ...(input.faqName ? { name: input.faqName } : {}),
      });
    }
  }

  return nodes;
}

export function serializeBlogPostSchema(input: BlogPostSchemaInput): string {
  return jsonLdGraph(buildBlogPostSchemaGraph(input));
}

/** Fallback author URL under site origin when no author page exists. */
export function defaultAuthorUrl(authorSlug: string, origin?: string): string {
  const slug = authorSlug.trim().toLowerCase().replace(/\s+/g, "-") || "author";
  return absoluteUrlFromPath(`/authors/${encodeURIComponent(slug)}`, origin);
}
