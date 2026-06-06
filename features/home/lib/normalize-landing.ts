import type { LandingPageData, LandingPageResponse } from "../types";

/** Ensures landing payload is safe to render when a country has partial or missing blocks. */
export function normalizeLandingResponse(
  response: LandingPageResponse | null | undefined,
): LandingPageData | null {
  const raw = response?.data;
  if (!raw || typeof raw !== "object") return null;

  const hero =
    raw.hero && typeof raw.hero === "object" && Object.keys(raw.hero).length > 0
      ? raw.hero
      : undefined;

  return {
    hero,
    accreditation: raw.accreditation,
    partners: raw.partners,
  };
}
