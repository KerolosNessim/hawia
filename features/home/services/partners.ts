import { resolveMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { apiClient } from "@/lib/api";
import type { Partner, PartnersResponse } from "../types";

/** Public partners list for the home clients section (`/v1/partners`). */
export function getPartners(): Promise<PartnersResponse> {
  return apiClient.get("/v1/partners");
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

export function extractPartnersFromResponse(res: PartnersResponse | undefined): Partner[] {
  return normalizePartnersList(res?.data?.data);
}
