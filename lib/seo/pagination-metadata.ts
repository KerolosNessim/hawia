import type { Metadata } from "next";
import { getAbsoluteUrl } from "./metadata-helpers";

/** Blog index, category, and tag listing pages (notes.txt #35). */
export const BLOG_LIST_PER_PAGE = 10;

export type PaginationSeoInput = {
  currentPage: number;
  lastPage: number;
  /** Locale-prefixed path; page 1 must omit `?page=1`. */
  hrefForPage: (page: number) => string;
};

export async function buildPaginationSeoFields(
  input: PaginationSeoInput,
): Promise<{
  canonical: string;
  pagination?: Metadata["pagination"];
}> {
  const { currentPage, lastPage, hrefForPage } = input;
  const canonical = await getAbsoluteUrl(hrefForPage(currentPage));
  const pagination: NonNullable<Metadata["pagination"]> = {};

  if (currentPage > 1) {
    pagination.previous = await getAbsoluteUrl(hrefForPage(currentPage - 1));
  }
  if (currentPage < lastPage) {
    pagination.next = await getAbsoluteUrl(hrefForPage(currentPage + 1));
  }

  const hasLinks = pagination.previous != null || pagination.next != null;
  return {
    canonical,
    pagination: hasLinks ? pagination : undefined,
  };
}

/** Merges self-referencing canonical and rel prev/next into existing metadata. */
export async function applyPaginationSeo(
  metadata: Metadata,
  input: PaginationSeoInput,
): Promise<Metadata> {
  const seo = await buildPaginationSeoFields(input);
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: seo.canonical,
    },
    ...(seo.pagination ? { pagination: seo.pagination } : {}),
  };
}
