/**
 * Default heading colors for CMS rich HTML (keep in sync with dashboard editor-colors.ts).
 * Inline `style="color: …"` on saved content always wins; these are fallbacks for legacy HTML.
 */
export const CMS_HEADING_COLORS = {
  h1: "#111827",
  h2: "#a3cd39",
  h3: "#2563eb",
  h4: "#0891b2",
  h5: "#4b5563",
  h6: "#6b7280",
} as const;
