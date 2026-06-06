import {
  fetchSolutionCategoriesSection,
  type SolutionCategoriesSectionData,
} from "@/features/clients/services/clients-public-api";

export type { SolutionCategoriesSectionData };

/**
 * Home “client samples” section — `GET /v1/solutions/categories`.
 */
export async function getAdsData(countryId?: number): Promise<SolutionCategoriesSectionData | null> {
  const { getLocale } = await import("next-intl/server");
  const locale = await getLocale();
  return fetchSolutionCategoriesSection(locale, { countryId });
}
