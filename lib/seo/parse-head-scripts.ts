export type ParsedHeadScript = {
  src?: string;
  async?: boolean;
  defer?: boolean;
  /** Inline script body (no `src`). */
  content?: string;
  id?: string;
  type?: string;
};

function parseHtmlAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*["']([^"']*)["']/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(attrString)) !== null) {
    attrs[match[1].toLowerCase()] = match[2];
  }
  return attrs;
}

/** Extracts `<script>` tags from CMS `custom_head_scripts` HTML. */
export function parseHeadScriptsMarkup(markup: string | null | undefined): ParsedHeadScript[] {
  if (!markup?.trim()) return [];

  const scripts: ParsedHeadScript[] = [];
  const withBody = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = withBody.exec(markup)) !== null) {
    const attrs = parseHtmlAttributes(match[1]);
    const content = match[2].trim();
    scripts.push({
      src: attrs.src,
      async: "async" in attrs,
      defer: "defer" in attrs,
      content: attrs.src ? undefined : content || undefined,
      id: attrs.id,
      type: attrs.type,
    });
  }

  const selfClosing = /<script\b([^>]*)\/>/gi;
  while ((match = selfClosing.exec(markup)) !== null) {
    const attrs = parseHtmlAttributes(match[1]);
    if (!attrs.src) continue;
    scripts.push({
      src: attrs.src,
      async: "async" in attrs,
      defer: "defer" in attrs,
      id: attrs.id,
      type: attrs.type,
    });
  }

  return scripts;
}
