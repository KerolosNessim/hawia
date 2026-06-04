export type HomeCountrySearchParams = Record<string, string | string[] | undefined>;

function firstSearchValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function homeCountryOverrideEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_HOME_COUNTRY_OVERRIDE === "true"
  );
}

export function parseHomeCountryOverride(
  searchParams: HomeCountrySearchParams | undefined,
): string | undefined {
  if (!homeCountryOverrideEnabled()) return undefined;

  const raw =
    firstSearchValue(searchParams?.country_id) ??
    firstSearchValue(searchParams?.country);
  const normalized = raw?.trim();
  return normalized || undefined;
}
