import { apiClient, ApiError } from "@/lib/api";
import { homeCountryQuery } from "../lib/country-query";
import type { WhyUsResponse } from "../types";

/**
 * Fetches landing page data (hero, accreditation, partners) from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getWhyUsData = async (countryId?: number): Promise<WhyUsResponse> => {
  const query = homeCountryQuery(countryId);
  try {
    return await apiClient.get("/v1/why-choose-us", {
      query: query ?? undefined,
    });
  } catch (e) {
    if (e instanceof ApiError) {
      return { status: "true", message: "", data: null as unknown as WhyUsResponse["data"] };
    }
    throw e;
  }
};
