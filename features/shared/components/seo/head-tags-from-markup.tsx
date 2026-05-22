import type { ReactNode } from "react";

function parseHtmlAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*["']([^"']*)["']/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(attrString)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function extractTags(markup: string, tagName: "meta" | "link"): string[] {
  const re = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  return markup.match(re) ?? [];
}

/**
 * Renders `<meta>` / `<link>` tags inside `<head>` (from CMS body scripts we hoisted).
 */
export function HeadTagsFromMarkup({ markup }: { markup: string }) {
  if (!markup.trim()) return null;

  const elements: ReactNode[] = [];
  let key = 0;

  for (const tag of extractTags(markup, "meta")) {
    const attrs = parseHtmlAttributes(tag.replace(/^<meta\b/i, "").replace(/>$/i, ""));
    elements.push(<meta key={`meta-${key++}`} {...attrs} />);
  }

  for (const tag of extractTags(markup, "link")) {
    const attrs = parseHtmlAttributes(tag.replace(/^<link\b/i, "").replace(/\/?>$/i, ""));
    elements.push(<link key={`link-${key++}`} {...attrs} />);
  }

  return <>{elements}</>;
}
