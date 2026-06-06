/** Pick locale-specific image alt from API (string or `{ ar, en }`). */

export function pickImageAlt(raw: unknown, locale: string, fallback = ""): string {
  if (raw == null) return fallback;
  if (typeof raw === "string") {
    const s = raw.trim();
    return s || fallback;
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const key = locale.startsWith("ar") ? "ar" : "en";
    const primary = o[key];
    if (typeof primary === "string" && primary.trim()) return primary.trim();
    const other = o.en ?? o.ar;
    if (typeof other === "string" && other.trim()) return other.trim();
  }
  return fallback;
}
