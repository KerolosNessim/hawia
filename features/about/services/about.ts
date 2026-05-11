import { apiClient } from "@/lib/api";
import type { AboutUsResponse } from "../types";

/**
 * Fetches FAQ data from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getAboutData = (): Promise<AboutUsResponse> => {
  return apiClient.get("/v1/about-us");
};