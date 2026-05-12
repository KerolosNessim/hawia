import { apiClient, ApiError } from "@/lib/api";
import type { AdsResponse } from "../types";

/**
 * Public solutions block for the home page (`/v1/solutions`).
 * Returns `null` when the API reports missing section (e.g. not seeded yet) so the page still renders.
 */
export async function getAdsData(): Promise<AdsResponse | null> {
  try {
    return await apiClient.get<AdsResponse>("/v1/solutions");
  } catch (e) {
    if (e instanceof ApiError) return null;
    throw e;
  }
}