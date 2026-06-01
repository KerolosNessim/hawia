import { normalizeServicesForLocale } from "../lib/normalize-service";
import type { GetServicesResponse } from "../types";
import { fetchServicesListMerged } from "./fetch-services-list";

/**
 * Fetches all services from the backend.
 * The API returns `data: { data: Service[], meta }`; this unwraps to a flat `data: Service[]`.
 * Titles fall back to the other locale when the active locale has no text.
 */
export type GetServicesOptions = {
  country_id?: number;
};

export const getServices = async (
  locale = "ar",
  options?: GetServicesOptions,
): Promise<GetServicesResponse> => {
  const query: Record<string, string> | undefined =
    options?.country_id != null && options.country_id > 0
      ? { country_id: String(options.country_id) }
      : undefined;
  const { raw, rows } = await fetchServicesListMerged(locale, query);
  return {
    status: raw.status,
    message: raw.message,
    data: normalizeServicesForLocale(rows, locale),
    meta: raw.data?.meta,
  };
};
