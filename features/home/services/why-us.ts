import { apiClient } from "@/lib/api";
import type { WhyUsResponse } from "../types";

/**
 * Fetches landing page data (hero, accreditation, partners) from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getWhyUsData =  (): Promise<WhyUsResponse> => {
  return  apiClient.get("/v1/why-choose-us");
};