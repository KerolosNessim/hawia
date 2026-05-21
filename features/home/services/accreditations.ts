import { apiClient } from "@/lib/api";
import type { AccreditationResponse } from "../types";

/** Public accreditations block for the home page (`/v1/accreditations`). */
export function getAccreditations(): Promise<AccreditationResponse> {
  return apiClient.get("/v1/accreditations");
}
