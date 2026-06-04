import type { Country } from "../types";

function countryText(country: Country): string {
  const raw = country.name as unknown;
  if (typeof raw === "string") return raw.toLowerCase();
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const localized = raw as { ar?: unknown; en?: unknown };
    return [localized.en, localized.ar]
      .filter((value): value is string => typeof value === "string")
      .join(" ")
      .toLowerCase();
  }
  return "";
}

export function countryFlagEmoji(country: Country): string {
  const text = countryText(country);
  if (
    text.includes("oman") ||
    text.includes("\u0639\u0645\u0627\u0646") ||
    text.includes("\u0639\u064f\u0645\u0627\u0646")
  ) {
    return "\ud83c\uddf4\ud83c\uddf2";
  }
  return "\ud83c\uddf8\ud83c\udde6";
}
