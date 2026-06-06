export function homeCountryQuery(
  countryId: number | undefined,
): Record<string, string> | undefined {
  if (countryId == null || countryId <= 0) return undefined;
  return { country_id: String(countryId) };
}
