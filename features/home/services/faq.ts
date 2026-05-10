import { apiClient } from "@/lib/api";
import type { FaqResponse } from "../types";

/**
 * Fetches FAQ data from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getFaqData = (): Promise<FaqResponse> => {
  return apiClient.get("/v1/faqs");
};
