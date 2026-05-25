/** Plain string or `{ ar, en }` from CMS / Accept-Language responses. */
export function pickLocalizedField(field: unknown, locale: string): string {
  if (field == null) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && !Array.isArray(field)) {
    const o = field as Record<string, unknown>;
    const key = locale.startsWith("ar") ? "ar" : "en";
    const primary = o[key];
    if (typeof primary === "string" && primary.trim()) return primary;
    const fallback = o.en ?? o.ar;
    if (typeof fallback === "string") return fallback;
  }
  return "";
}

export function pickSlugLocal(raw: Record<string, unknown>): { ar?: string; en?: string } | undefined {
  const local = raw.slug_local;
  if (!local || typeof local !== "object" || Array.isArray(local)) return undefined;
  const o = local as Record<string, unknown>;
  return {
    ar: typeof o.ar === "string" ? o.ar : undefined,
    en: typeof o.en === "string" ? o.en : undefined,
  };
}
