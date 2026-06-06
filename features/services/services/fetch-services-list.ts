import { apiClient } from "@/lib/api";
import { mergeServiceListsByLocale } from "../lib/merge-service-locale-rows";
import { fetchServiceCatalogListMerged } from "./fetch-service-catalog-list";
import type { GetServicesApiRaw } from "../types";

function acceptLanguage(locale: string): "ar" | "en" {
  return locale.toLowerCase().startsWith("en") ? "en" : "ar";
}

async function fetchServicesRaw(
  lang: "ar" | "en",
  query?: Record<string, string>,
): Promise<GetServicesApiRaw> {
  return apiClient.get<GetServicesApiRaw>("/v1/services", {
    headers: { "Accept-Language": lang },
    query: query && Object.keys(query).length > 0 ? query : undefined,
  });
}

/** Loads every page when the caller did not pass `page` (e.g. home / footer lists). */
async function fetchServicesRawAllPages(
  lang: "ar" | "en",
  query?: Record<string, string>,
): Promise<GetServicesApiRaw> {
  const first = await fetchServicesRaw(lang, query);
  const meta = first.data?.meta;
  if (!meta || meta.last_page <= 1) return first;

  const merged = [...(first.data?.data ?? [])];
  for (let page = 2; page <= meta.last_page; page++) {
    const next = await fetchServicesRaw(lang, { ...query, page: String(page) });
    merged.push(...(next.data?.data ?? []));
  }

  return {
    ...first,
    data: {
      data: merged,
      meta: {
        ...meta,
        current_page: 1,
        last_page: 1,
        per_page: merged.length,
        total: merged.length,
      },
    },
  };
}

/** Loads services for the active locale and merges titles from the other locale when empty. */
export async function fetchServicesListMerged(
  locale = "ar",
  query?: Record<string, string>,
): Promise<{
  raw: GetServicesApiRaw;
  rows: Record<string, unknown>[];
}> {
  // Catalog may exist but be empty (e.g. country filter not implemented there yet).
  const catalog = await fetchServiceCatalogListMerged(locale, query);
  if (catalog && catalog.rows.length > 0) return catalog;

  const active = acceptLanguage(locale);
  const other = active === "en" ? "ar" : "en";
  const fetchPage = query?.page ? fetchServicesRaw : fetchServicesRawAllPages;

  const [rawActive, rawOther] = await Promise.all([
    fetchPage(active, query),
    fetchPage(other, query),
  ]);

  const activeRows = rawActive.data?.data ?? [];
  const otherRows = rawOther.data?.data ?? [];
  const rows = mergeServiceListsByLocale(activeRows, otherRows);

  return { raw: rawActive, rows };
}
