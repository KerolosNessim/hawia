/** True when the API provided a non-empty image URL (no placeholder fallbacks). */
export function hasSectionImage(image: string | null | undefined): boolean {
  return typeof image === "string" && image.trim().length > 0;
}
