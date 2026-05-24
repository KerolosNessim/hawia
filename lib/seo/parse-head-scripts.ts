import { parseHtmlAttributes } from "@/lib/seo/parse-html-attributes";

export type ParsedHeadScript = {
  src?: string;
  async?: boolean;
  defer?: boolean;
  /** Inline script body (no `src`). */
  content?: string;
  id?: string;
  type?: string;
};

/** Extracts `<script>` tags from CMS `custom_head_scripts` HTML. */
export function parseHeadScriptsMarkup(markup: string | null | undefined): ParsedHeadScript[] {
  if (!markup?.trim()) return [];

  const scripts: ParsedHeadScript[] = [];
  const withBody = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = withBody.exec(markup)) !== null) {
    const attrs = parseHtmlAttributes(match[1]);
    const content = match[2].trim();
    const src = typeof attrs.src === "string" ? attrs.src : undefined;
    scripts.push({
      src,
      async: attrs.async === true,
      defer: attrs.defer === true,
      content: src ? undefined : content || undefined,
      id: typeof attrs.id === "string" ? attrs.id : undefined,
      type: typeof attrs.type === "string" ? attrs.type : undefined,
    });
  }

  const selfClosing = /<script\b([^>]*)\/>/gi;
  while ((match = selfClosing.exec(markup)) !== null) {
    const attrs = parseHtmlAttributes(match[1]);
    const src = typeof attrs.src === "string" ? attrs.src : undefined;
    if (!src) continue;
    scripts.push({
      src,
      async: attrs.async === true,
      defer: attrs.defer === true,
      id: typeof attrs.id === "string" ? attrs.id : undefined,
      type: typeof attrs.type === "string" ? attrs.type : undefined,
    });
  }

  return scripts;
}
