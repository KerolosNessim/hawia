import {
  type CountryRouteCode,
  resolveSupportedCountry,
} from "@/features/shared/lib/country-routes";
import { cookies, headers } from "next/headers";

/**
 * Gets the visitor country from geo IP headers (Vercel / Cloudflare).
 * Falls back to cookie then `SA` when geo headers are unavailable (e.g. local dev).
 */
export async function getServerCountry(): Promise<string> {
  const headersList = await headers();
  const countryHeader =
    headersList.get("x-vercel-ip-country") || headersList.get("cf-ipcountry");

  if (countryHeader?.trim()) return countryHeader.trim().toUpperCase();

  const cookieStore = await cookies();
  const cookieCountry = cookieStore.get("user_country")?.value;

  return cookieCountry?.trim().toUpperCase() || "SA";
}

/** Supported route country (`SA` or `OM`) from middleware cookie / geo headers. */
export async function getServerCountryRouteCode(): Promise<CountryRouteCode> {
  return resolveSupportedCountry(await getServerCountry());
}
