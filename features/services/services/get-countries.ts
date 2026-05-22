import { apiClient } from "@/lib/api";
import type { Country, GetServicesApiRaw } from "../types";

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
export const getFooterServices = async (countryId: number) => {
  const raw = await apiClient.get<{ status: string; message: string; data: unknown }>(
    `/v1/countries/${countryId}/footer-services`,
  );
  return {
    status: raw.status,
    message: raw.message,
    data: raw.data ?? [],
  };
};
