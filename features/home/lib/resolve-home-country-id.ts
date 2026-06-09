import { matchCountryByUserCode } from "@/features/services/lib/country-match";
import {
  fetchPublicCountriesPrepared,
} from "@/features/services/services/public-services-api";
import { resolveSelectedCountryId } from "@/features/services/lib/prepare-countries-list";
import { cookies, headers } from "next/headers";

/**
 * Resolves numeric `country_id` for public home landing content from the visitor geo cookie.
 */
export async function resolveHomeCountryId(
  countryOverride?: string,
): Promise<number | undefined> {
  const cookieStore = await cookies();
  const headersList = await headers();
  const userCountryCode =
    countryOverride ??
    headersList.get("x-country-route") ??
    cookieStore.get("user_country")?.value ??
    "SA";
  const prepared = await fetchPublicCountriesPrepared();
  const { countries } = prepared;

  const overrideId = Number(countryOverride);
  if (Number.isFinite(overrideId) && overrideId > 0) {
    const resolved = resolveSelectedCountryId(overrideId, prepared);
    if (resolved != null) return resolved;
  }

  const matched = matchCountryByUserCode(countries, userCountryCode);
  return matched?.id;
}
