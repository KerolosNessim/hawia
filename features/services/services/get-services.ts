import { apiClient } from "@/lib/api";
import type { GetServicesResponse } from "../types";

/**
 * Fetches all services from the backend.
 * The apiClient automatically attaches the current locale and auth token.
 */
export const getServices = (): Promise<GetServicesResponse> => {
  return apiClient.get("/v1/services");
};
