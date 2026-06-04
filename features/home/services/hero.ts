import { apiClient, ApiError } from "@/lib/api";
import { homeCountryQuery } from "../lib/country-query";
import type { LandingPageResponse } from "../types";

/**
 * Fetches landing page data (hero, accreditation, partners) scoped by `country_id`.
 */
export const getLandingPageData = async (
  countryId?: number,
): Promise<LandingPageResponse> => {
  const query = homeCountryQuery(countryId);
  try {
    return await apiClient.get<LandingPageResponse>("/v1/landing", {
      query: query ?? undefined,
    });
  } catch (e) {
    if (e instanceof ApiError && /not found/i.test(e.message)) {
      return { status: "true", message: "", data: {} };
    }
    throw e;
  }
};