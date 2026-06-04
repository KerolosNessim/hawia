import { apiClient } from "@/lib/api";
import { homeCountryQuery } from "../lib/country-query";
import type { FaqResponse } from "../types";

/**
 * Fetches FAQ data from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getFaqData = (countryId?: number): Promise<FaqResponse> => {
  const query = homeCountryQuery(countryId);
  return apiClient.get("/v1/faqs", {
    query: query ?? undefined,
  });
};
