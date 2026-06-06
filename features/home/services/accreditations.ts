import { apiClient } from "@/lib/api";
import { homeCountryQuery } from "../lib/country-query";
import type { AccreditationResponse } from "../types";

/** Public accreditations block for the home page (`/v1/accreditations`). */
export function getAccreditations(countryId?: number): Promise<AccreditationResponse> {
  const query = homeCountryQuery(countryId);
  return apiClient.get("/v1/accreditations", {
    query: query ?? undefined,
  });
}
