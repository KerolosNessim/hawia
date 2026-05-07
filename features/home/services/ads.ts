import { apiClient } from "@/lib/api";
import type { AdsResponse } from "../types";

/**
 * Fetches landing page data (hero, accreditation, partners) from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getAdsData =  (): Promise<AdsResponse> => {
  return  apiClient.get("/v1/solutions");
};