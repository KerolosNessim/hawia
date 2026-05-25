/** Path without locale prefix — use with `@/i18n/navigation` `Link`. */
export function clientsIndexPath(opts?: { categorySlug?: string | null }): string {
  const p = new URLSearchParams();
  const slug = opts?.categorySlug?.trim();
  if (slug) p.set("category", slug);
  const q = p.toString();
  return q ? `/clients?${q}` : "/clients";
}
