export type ServicesSearchParams = Record<string, string | string[] | undefined>;

export function parseCountryId(sp: ServicesSearchParams): number | undefined {
  const raw =
    typeof sp.country_id === "string"
      ? sp.country_id
      : Array.isArray(sp.country_id)
        ? sp.country_id[0]
        : undefined;
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function parsePage(sp: ServicesSearchParams): number {
  const raw =
    typeof sp.page === "string" ? sp.page : Array.isArray(sp.page) ? sp.page[0] : "1";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
