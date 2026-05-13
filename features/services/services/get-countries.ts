import { apiClient } from "@/lib/api";
import type { GetServicesApiRaw, GetServicesResponse } from "../types";

/**
 * Fetches all services from the backend.
 * The API returns `data: { data: Service[], meta }`; this unwraps to a flat `data: Service[]`.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getCountries = async (): Promise<GetServicesResponse> => {
  const raw = await apiClient.get<GetServicesApiRaw>("/v1/countries");
  return {
    status: raw.status,
    message: raw.message,
    data: raw.data?.data ?? [],
    meta: raw.data?.meta,
  };
};

/**
 * Fetches footer services for a specific country.
 */
export const getFooterServices = async (countryId: number): Promise<GetServicesResponse> => {
  const raw = await apiClient.get<any>(`/v1/countries/${countryId}/footer-services`);
  return {
    status: raw.status,
    message: raw.message,
    data: raw.data ?? [],
  };
};