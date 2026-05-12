"use client";

import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import { blogCategoryHref, blogIndexHref } from "@/features/blogs/lib/blog-routes";
import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";
import type { Locale } from "next-intl";
import { useLocale } from "next-intl";

type Props = {
  meta: LaravelPaginationMeta;
  variant: "index" | "category";
  /** Required when `variant` is `"category"`. */
  categorySlug?: string;
  search?: string;
  previousLabel: string;
  nextLabel: string;
  isRtl?: boolean;
};

export function BlogListPagination({
  meta,
  variant,
  categorySlug,
  search,
  previousLabel,
  nextLabel,
  isRtl,
}: Props) {
  const locale = useLocale() as Locale;

  const getPageUrl = (page: number) =>
    variant === "category" && categorySlug
      ? blogCategoryHref(locale, categorySlug, page, { search })
      : blogIndexHref(locale, page, { search });

  return (
    <LaravelResourcePagination
      meta={meta}
      getPageUrl={getPageUrl}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      isRtl={isRtl}
    />
  );
}
