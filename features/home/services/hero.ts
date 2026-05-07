import { apiClient } from "@/lib/api";
import type { LandingPageResponse } from "../types";

/**
 * Fetches landing page data (hero, accreditation, partners) from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getLandingPageData =  (): Promise<LandingPageResponse> => {
  return  apiClient.get("/v1/landing");
};