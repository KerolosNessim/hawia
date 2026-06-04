import { completeLaravelPaginationMeta, type LaravelPaginationMeta } from "@/lib/laravel-pagination";
import { apiClient } from "@/lib/api";
import { normalizeServicesForLocale } from "../lib/normalize-service";
import {
  prepareCountriesList,
  unwrapCountries,
  type PreparedCountries,
} from "../lib/prepare-countries-list";
import type { Country, GetServicesApiRaw, Service } from "../types";
import { fetchServicesListMerged } from "./fetch-services-list";

export type { PreparedCountries };

export async function fetchPublicCountriesPrepared(): Promise<PreparedCountries> {
  try {
    const raw = await apiClient.get<GetServicesApiRaw>("/v1/countries");
    return prepareCountriesList(unwrapCountries(raw));
  } catch {
    return { countries: [], idAlias: new Map() };
  }
}

export async function fetchPublicCountries(): Promise<Country[]> {
  const { countries } = await fetchPublicCountriesPrepared();
  return countries;
}

export type FetchPublicServicesPaginatedParams = {
  paginationPath: string;
  locale?: string;
  page?: number;
  per_page?: number;
  country_id?: number;
};

export async function fetchPublicServicesPaginated(
  params: FetchPublicServicesPaginatedParams,
): Promise<{ services: Service[]; meta: LaravelPaginationMeta }> {
  const q: Record<string, string> = {};
  if (params.page != null && params.page > 0) q.page = String(params.page);
  if (params.per_page != null && params.per_page > 0) q.per_page = String(params.per_page);
  if (params.country_id != null && params.country_id > 0) {
    q.country_id = String(params.country_id);
  }

  try {
    const locale = params.locale ?? "ar";
    const { raw, rows } = await fetchServicesListMerged(
      locale,
      Object.keys(q).length ? q : undefined,
    );
    const services = normalizeServicesForLocale(rows, locale);
    const metaPartial = raw.data?.meta ?? {
      current_page: 1,
      last_page: 1,
      per_page: params.per_page ?? 12,
      total: 0,
    };
    const meta =
      completeLaravelPaginationMeta(metaPartial, params.paginationPath) ??
      completeLaravelPaginationMeta(
        { current_page: 1, last_page: 1, per_page: 12, total: 0 },
        params.paginationPath,
      )!;

    return { services, meta };
  } catch {
    const meta = completeLaravelPaginationMeta(
      { current_page: 1, last_page: 1, per_page: params.per_page ?? 12, total: 0 },
      params.paginationPath,
    )!;
    return { services: [], meta };
  }
}
