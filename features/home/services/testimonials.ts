import { apiClient } from "@/lib/api";
import { homeCountryQuery } from "../lib/country-query";
import type { TestimonialsResponse } from "../types";

/**
 * Fetches testimonials data from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getTestimonialsData = (countryId?: number): Promise<TestimonialsResponse> => {
  const query = homeCountryQuery(countryId);
  return apiClient.get("/v1/testimonials", {
    query: query ?? undefined,
  });
};
