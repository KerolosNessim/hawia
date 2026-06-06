import { getCanonicalSiteUrl } from "@/lib/seo/site-url";

export function schemaOrigin(origin?: string): string {
  return (origin ?? getCanonicalSiteUrl()).replace(/\/$/, "");
}

export function organizationId(origin?: string): string {
  return `${schemaOrigin(origin)}/#organization`;
}

export function logoId(origin?: string): string {
  return `${schemaOrigin(origin)}/#logo`;
}

export function websiteId(origin?: string): string {
  return `${schemaOrigin(origin)}/#website`;
}

export function servicesCatalogId(origin?: string): string {
  return `${schemaOrigin(origin)}/#services`;
}

export function pageWebPageId(pageUrl: string): string {
  return `${pageUrl.replace(/\/$/, "")}#webpage`;
}

export function pageBreadcrumbId(pageUrl: string): string {
  return `${pageUrl.replace(/\/$/, "")}#breadcrumb`;
}

export function pageFaqId(pageUrl: string): string {
  return `${pageUrl.replace(/\/$/, "")}#faq`;
}

export function pageServiceId(pageUrl: string): string {
  return `${pageUrl.replace(/\/$/, "")}#service`;
}

export function pageArticleId(pageUrl: string): string {
  return `${pageUrl.replace(/\/$/, "")}#article`;
}

export function pageBlogId(pageUrl: string): string {
  return `${pageUrl.replace(/\/$/, "")}#blog`;
}
