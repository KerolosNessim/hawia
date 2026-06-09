import { homeCountryQuery } from "@/features/home/lib/country-query";
import { apiClient } from "@/lib/api";
import { pickActiveContactHeaders } from "../lib/pick-active-contact-headers";
import type { ContactHeader, ContactHeadersResponse } from "../types";

export async function fetchContactHeaders(
  countryId?: number,
): Promise<ContactHeader[]> {
  try {
    const query = homeCountryQuery(countryId);
    const response = await apiClient.get<ContactHeadersResponse>(
      "/v1/contact/headers",
      { query: query ?? undefined },
    );
    const rows = Array.isArray(response?.data) ? response.data : [];
    return pickActiveContactHeaders(rows);
  } catch {
    return [];
  }
}
