import { apiClient } from "@/lib/api";
import type {  GetSingleServiceResponse } from "../types";

/**
 * Fetches all services from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getSingleService = (slug: string): Promise<GetSingleServiceResponse> => {
  return apiClient.get(`/v1/services/${slug}`);
};