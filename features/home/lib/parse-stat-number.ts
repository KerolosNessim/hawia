export type ParsedStatNumber = {
  /** Text before the numeric part (e.g. "+"). */
  prefix: string;
  /** Numeric value for animation; null when the string has no digits. */
  value: number | null;
  /** Text after the numeric part (e.g. "K", "+"). */
  suffix: string;
  /** Original trimmed input. */
  display: string;
};

/**
 * Splits values like "+5K", "200+", "10" into prefix, number, and suffix.
 */
export function parseStatNumber(raw: string | null | undefined): ParsedStatNumber {
  const display = (raw ?? "").trim();
  if (!display) {
    return { prefix: "", value: null, suffix: "", display: "" };
  }

  const match = display.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { prefix: "", value: null, suffix: "", display };
  }

  const prefix = match[1] ?? "";
  const numeric = match[2] ?? "";
  const suffix = match[3] ?? "";
  const value = numeric ? Number.parseFloat(numeric) : null;

  return {
    prefix,
    value: value != null && Number.isFinite(value) ? value : null,
    suffix,
    display,
  };
}
