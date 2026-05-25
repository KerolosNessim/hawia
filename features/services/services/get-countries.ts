import { apiClient } from "@/lib/api";
import { mergeServiceListsByLocale } from "../lib/merge-service-locale-rows";
import { normalizeServicesForLocale } from "../lib/normalize-service";
import type { Country, GetServicesApiRaw, Service } from "../types";

export type GetCountriesResponse = {
  status: string;
  message: string;
  data: Country[];
};

/**
 * Fetches countries from GET /v1/countries.
 * The API returns `data: { data: Country[], meta }`; this unwraps to a flat `data: Country[]`.
 */
export const getCountries = async (): Promise<GetCountriesResponse> => {
  const raw = await apiClient.get<GetServicesApiRaw>("/v1/countries");
  return {
    status: raw.status,
    message: raw.message,
    data: (raw.data?.data ?? []) as Country[],
  };
};

/**
 * Fetches footer services for a specific country.
 */
async function fetchFooterServicesRaw(
  countryId: number,
  lang: "ar" | "en",
): Promise<unknown[]> {
  const raw = await apiClient.get<{ status: string; message: string; data: unknown }>(
    `/v1/countries/${countryId}/footer-services`,
    { headers: { "Accept-Language": lang } },
  );
  return Array.isArray(raw.data) ? raw.data : [];
}

export const getFooterServices = async (countryId: number, locale = "ar") => {
  const active = locale.toLowerCase().startsWith("en") ? "en" : "ar";
  const other = active === "en" ? "ar" : "en";
  const [rawActive, activeRows, otherRows] = await Promise.all([
    apiClient.get<{ status: string; message: string; data: unknown }>(
      `/v1/countries/${countryId}/footer-services`,
      { headers: { "Accept-Language": active } },
    ),
    fetchFooterServicesRaw(countryId, other),
  ]);
  const rows = mergeServiceListsByLocale(
    Array.isArray(rawActive.data) ? rawActive.data : [],
    otherRows,
  );
  return {
    status: rawActive.status,
    message: rawActive.message,
    data: normalizeServicesForLocale(rows, locale) as Service[],
  };
};
