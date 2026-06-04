import { apiClient, ApiError } from "@/lib/api";
import { homeCountryQuery } from "../lib/country-query";
import type { StepsResponse } from "../types";
import { normalizeHelpYouSteps } from "../utils/normalize-steps-data";

/**
 * Help-you / steps list for the home page (`/v1/help-you`).
 * Normalizes wrapped payloads and returns an empty list when the section is missing or errored.
 */
export async function getStepsData(countryId?: number): Promise<StepsResponse> {
  const empty: StepsResponse = { status: "true", message: "", data: [] };
  const query = homeCountryQuery(countryId);
  try {
    const raw = await apiClient.get<StepsResponse & { data: unknown }>("/v1/help-you", {
      query: query ?? undefined,
    });
    return {
      status: raw.status,
      message: raw.message,
      data: normalizeHelpYouSteps(raw.data),
    };
  } catch (e) {
    if (e instanceof ApiError) return empty;
    throw e;
  }
}
