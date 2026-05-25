/**
 * Safely decodes URL path segments (including Arabic slugs and double-encoding).
 * Used by breadcrumbs, blog routes, and other slug-based navigation.
 */
export function decodePathSegment(segment: string): string {
  let current = segment.trim();
  if (!current) return current;

  try {
    let prev = "";
    while (prev !== current) {
      prev = current;
      current = decodeURIComponent(current.replace(/\+/g, " "));
    }
  } catch {
    /* keep current */
  }

  try {
    return current.normalize("NFKC");
  } catch {
    return current;
  }
}
