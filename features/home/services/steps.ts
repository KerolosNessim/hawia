import { apiClient, ApiError } from "@/lib/api";
import type { StepsResponse } from "../types";
import { normalizeHelpYouSteps } from "../utils/normalize-steps-data";

/**
 * Help-you / steps list for the home page (`/v1/help-you`).
 * Normalizes wrapped payloads and returns an empty list when the section is missing or errored.
 */
export async function getStepsData(): Promise<StepsResponse> {
  const empty: StepsResponse = { status: "true", message: "", data: [] };
  try {
    const raw = await apiClient.get<StepsResponse & { data: unknown }>("/v1/help-you");
    return {
      status: raw.status,
      message: raw.message,
      data: raw.data,
    };
  } catch (e) {
    if (e instanceof ApiError) return empty;
    throw e;
  }
}