import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { apiClient } from "@/lib/api";
import { homeCountryQuery } from "../lib/country-query";
import type { Partner, PartnersResponse } from "../types";

/** Public partners list for the home clients section (`/v1/partners`). */
export function getPartners(countryId?: number): Promise<PartnersResponse> {
  const query = homeCountryQuery(countryId);
  return apiClient.get("/v1/partners", {
    query: query ?? undefined,
  });
}

export function normalizePartnersList(raw: Partner[] | undefined): Partner[] {
  if (!raw?.length) return [];
  return raw.map((partner) => ({
    ...partner,
    images: (partner.images ?? []).map((img) => ({
      ...img,
      url: resolveMediaUrl(img.url),
    })),
  }));
}

export function normalizePartnersInput(
  raw: Partner[] | { data?: Partner[] } | undefined,
): Partner[] {
  if (Array.isArray(raw)) return normalizePartnersList(raw);
  return normalizePartnersList(raw?.data);
}

export function extractPartnersFromResponse(res: PartnersResponse | undefined): Partner[] {
  return normalizePartnersList(res?.data?.data);
}
