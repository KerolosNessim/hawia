import { apiClient } from "@/lib/api";
import { mergeServiceListsByLocale } from "../lib/merge-service-locale-rows";
import { normalizeServicesForLocale } from "../lib/normalize-service";
import {
  prepareCountriesList,
  unwrapCountries,
  type PreparedCountries,
} from "../lib/prepare-countries-list";
import type { Country, GetServicesApiRaw, Service } from "../types";

export type GetCountriesResponse = {
  status: string;
  message: string;
  data: Country[];
  idAlias: Map<number, number>;
};

/**
 * Fetches countries from GET /v1/countries.
 * Duplicate country records from the API are collapsed before returning.
 */
export const getCountries = async (): Promise<GetCountriesResponse> => {
  const raw = await apiClient.get<GetServicesApiRaw>("/v1/countries");
  const { countries, idAlias } = prepareCountriesList(unwrapCountries(raw));
  return {
    status: raw.status,
    message: raw.message,
    data: countries,
    idAlias,
  };
};

export type { PreparedCountries };

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
  const [rawActive, otherRows] = await Promise.all([
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
