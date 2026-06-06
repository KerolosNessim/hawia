/** Maps CMS/admin portfolio URLs to public site routes when possible. */
export function resolvePortfolioHref(
  href: string | null | undefined,
): { href: string; external: boolean } | null {
  const raw = href?.trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const path = url.pathname.toLowerCase();
      if (path.includes("client-portfolio") || path.includes("case-stud")) {
        const idMatch = path.match(/\/(\d+)\/?$/);
        if (idMatch) {
          return { href: `/clients/${idMatch[1]}`, external: false };
        }
        return { href: "/clients", external: false };
      }
      return { href: raw, external: true };
    } catch {
      return { href: raw, external: true };
    }
  }

  let path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path.toLowerCase().includes("client-portfolio")) {
    const idMatch = path.match(/\/(\d+)\/?$/);
    path = idMatch ? `/clients/${idMatch[1]}` : "/clients";
  }
  if (path.startsWith("/case-studies/")) {
    const idMatch = path.match(/\/case-studies\/(\d+)/);
    if (idMatch) path = `/clients/${idMatch[1]}`;
  }

  return { href: path, external: false };
}
