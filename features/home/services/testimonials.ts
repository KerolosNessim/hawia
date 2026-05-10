import { apiClient } from "@/lib/api";
import type { TestimonialsResponse } from "../types";

/**
 * Fetches testimonials data from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getTestimonialsData = (): Promise<TestimonialsResponse> => {
  return apiClient.get("/v1/testimonials");
};
