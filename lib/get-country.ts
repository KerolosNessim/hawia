import {
  type CountryRouteCode,
  resolveSupportedCountry,
} from "@/features/shared/lib/country-routes";
import { cookies, headers } from "next/headers";

/**
 * Gets the user's country code on the server side.
 * @returns {Promise<string>} The 2-letter country code (e.g., 'SA', 'US', 'EG')
 */
export async function getServerCountry(): Promise<string> {
  const headersList = await headers();
  const countryHeader =
    headersList.get("x-vercel-ip-country") || headersList.get("cf-ipcountry");

  if (countryHeader) return countryHeader;

  const cookieStore = await cookies();
  const cookieCountry = cookieStore.get("user_country")?.value;

  return cookieCountry || "SA";
}

/** Supported route country (`SA` or `OM`) from middleware cookie / geo headers. */
export async function getServerCountryRouteCode(): Promise<CountryRouteCode> {
  return resolveSupportedCountry(await getServerCountry());
}
