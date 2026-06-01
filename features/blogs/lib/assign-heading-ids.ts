import { slugifyHeadingAnchor } from "@/features/blogs/lib/slugify-heading-anchor";

const HEADING_RE = /<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function readExistingId(attrs: string): string | null {
  const m = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
  return m?.[1]?.trim() || null;
}

function extractTocAnchorIds(tocHtml: string): string[] {
  const ids: string[] = [];
  const re = /href\s*=\s*["']#([^"'#]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tocHtml)) !== null) {
    const id = m[1].trim();
    if (id) ids.push(id);
  }
  return ids;
}

/**
 * Ensures h1–h6 in CMS HTML have unique `id` attributes so TOC hash links work.
 * When `tocHtml` is provided, assigns TOC anchor ids (in order) to headings that lack ids.
 */
export function assignHeadingIdsToArticleHtml(
  html: string,
  options?: { tocHtml?: string },
): string {
  const trimmed = html?.trim();
  if (!trimmed) return html;

  const usedIds = new Set<string>();
  const tocAnchors = options?.tocHtml ? extractTocAnchorIds(options.tocHtml) : [];
  let tocAnchorIndex = 0;

  return trimmed.replace(HEADING_RE, (full, level: string, attrsRaw: string | undefined, inner: string) => {
    const attrs = attrsRaw ?? "";
    const existing = readExistingId(attrs);
    if (existing) {
      usedIds.add(existing);
      return full;
    }

    const text = stripTags(inner);
    if (!text) return full;

    let id: string | null = null;
    while (tocAnchorIndex < tocAnchors.length && !id) {
      const candidate = tocAnchors[tocAnchorIndex++];
      if (!usedIds.has(candidate)) {
        id = candidate;
        usedIds.add(candidate);
      }
    }

    if (!id) {
      id = slugifyHeadingAnchor(text, usedIds);
    }

    const spacer = attrs.length && !/\s$/.test(attrs) ? " " : "";
    return `<h${level}${attrs}${spacer}id="${id}">${inner}</h${level}>`;
  });
}
