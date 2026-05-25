import { cookies, headers } from 'next/headers';

/**
 * Gets the user's country code on the server side.
 * @returns {Promise<string>} The 2-letter country code (e.g., 'SA', 'US', 'EG')
 */
export async function getServerCountry(): Promise<string> {
  // Try to get from headers first (Vercel/Cloudflare)
  const headersList = await headers();
  const countryHeader = headersList.get('x-vercel-ip-country') || headersList.get('cf-ipcountry');

  if (countryHeader) return countryHeader;

  // Fallback to cookie set by middleware
  const cookieStore = await cookies();
  const cookieCountry = cookieStore.get('user_country')?.value;

  return cookieCountry || 'SA'; // Default fallback
}
