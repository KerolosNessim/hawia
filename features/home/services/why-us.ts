import { apiClient } from "@/lib/api";
import { homeCountryQuery } from "../lib/country-query";
import type { WhyUsResponse } from "../types";

/**
 * Fetches landing page data (hero, accreditation, partners) from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getWhyUsData =  (countryId?: number): Promise<WhyUsResponse> => {
  const query = homeCountryQuery(countryId);
  return  apiClient.get("/v1/why-choose-us", {
    query: query ?? undefined,
  });
};
