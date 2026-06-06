const DEFAULT_TZ_OFFSET = "+02:00";

/** Normalizes API/datetime strings to ISO 8601 for schema.org. */
export function toSchemaDate(
  value: string | null | undefined,
  timezoneOffset = DEFAULT_TZ_OFFSET,
): string | undefined {
  if (!value?.trim()) return undefined;
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    if (/[Z+-]\d{2}:\d{2}$/.test(raw) || raw.endsWith("Z")) return raw;
    return `${raw}${timezoneOffset}`;
  }
  const spaceMatch = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/);
  if (spaceMatch) {
    return `${spaceMatch[1]}T${spaceMatch[2]}${timezoneOffset}`;
  }
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return undefined;
}

export function countWordsFromHtml(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
