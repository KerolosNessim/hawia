"use client";

import { LaravelResourcePagination } from "@/components/ui/laravel-resource-pagination";
import { servicesIndexHref } from "@/features/services/lib/services-routes";
import type { CountryRouteCode } from "@/features/shared/lib/country-routes";
import type { LaravelPaginationMeta } from "@/lib/laravel-pagination";
import type { Locale } from "next-intl";
import { useLocale } from "next-intl";

type Props = {
  meta: LaravelPaginationMeta;
  countryCode: CountryRouteCode;
  previousLabel: string;
  nextLabel: string;
};

export function ServicesListPagination({
  meta,
  countryCode,
  previousLabel,
  nextLabel,
}: Props) {
  const locale = useLocale() as Locale;

  const getPageUrl = (page: number) =>
    servicesIndexHref(locale, page, { countryCode });

  return (
    <LaravelResourcePagination
      meta={meta}
      getPageUrl={getPageUrl}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
    />
  );
}
