"use client";

import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import { blogCategoryHref, blogIndexHref, blogTagHref } from "@/features/blogs/lib/blog-routes";
import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";
import type { Locale } from "next-intl";
import { useLocale } from "next-intl";

type Props = {
  meta: LaravelPaginationMeta;
  variant: "index" | "category" | "tag";
  /** Required when `variant` is `"category"`. */
  categorySlug?: string;
  /** Required when `variant` is `"tag"`. */
  tag?: string;
  search?: string;
  previousLabel: string;
  nextLabel: string;
  isRtl?: boolean;
};

export function BlogListPagination({
  meta,
  variant,
  categorySlug,
  tag,
  search,
  previousLabel,
  nextLabel,
  isRtl,
}: Props) {
  const locale = useLocale() as Locale;

  const getPageUrl = (page: number) => {
    if (variant === "tag" && tag) return blogTagHref(locale, tag, page);
    if (variant === "category" && categorySlug) {
      return blogCategoryHref(locale, categorySlug, page, { search });
    }
    return blogIndexHref(locale, page, { search });
  };

  return (
    <LaravelResourcePagination
      meta={meta}
      getPageUrl={getPageUrl}
      siblingCount={2}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      isRtl={isRtl}
    />
  );
}
