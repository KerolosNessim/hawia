import { apiClient } from "../../../lib/api";
import type { StepsResponse } from "../types";
/**
 * Fetches landing page data (hero, accreditation, partners) from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getStepsData =  (): Promise<StepsResponse> => {
  return apiClient.get("/v1/help-you");
};