import { normalizeServicesForLocale } from "../lib/normalize-service";
import type { GetServicesResponse } from "../types";
import { fetchServicesListMerged } from "./fetch-services-list";

/**
 * Fetches all services from the backend.
 * The API returns `data: { data: Service[], meta }`; this unwraps to a flat `data: Service[]`.
 * Titles fall back to the other locale when the active locale has no text.
 */
export const getServices = async (locale = "ar"): Promise<GetServicesResponse> => {
  const { raw, rows } = await fetchServicesListMerged(locale);
  return {
    status: raw.status,
    message: raw.message,
    data: normalizeServicesForLocale(rows, locale),
    meta: raw.data?.meta,
  };
};
