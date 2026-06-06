export type TocEntry = {
  href: string;
  label: string;
  level: number;
};

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Parses TOC HTML (`editor-toc` / `cms-toc`) into clickable entries.
 */
export function parseTocEntries(tocHtml: string): TocEntry[] {
  const trimmed = tocHtml.trim();
  if (!trimmed) return [];

  if (typeof DOMParser === "undefined") {
    return parseTocEntriesRegex(trimmed);
  }

  const doc = new DOMParser().parseFromString(`<div>${trimmed}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return parseTocEntriesRegex(trimmed);

  const entries: TocEntry[] = [];
  root.querySelectorAll("a[href^='#']").forEach((anchor) => {
    const href = anchor.getAttribute("href")?.trim();
    if (!href || href === "#") return;
    const label = (anchor.textContent ?? "").trim() || stripTags(anchor.innerHTML);
    if (!label) return;

    let level = 1;
    const li = anchor.closest("li");
    if (li) {
      let depth = 0;
      let el: Element | null = li;
      while (el && el !== root) {
        if (el.tagName === "UL" || el.tagName === "OL") depth += 1;
        el = el.parentElement;
      }
      level = Math.max(1, depth);
    }

    entries.push({ href, label, level });
  });

  return entries.length ? entries : parseTocEntriesRegex(trimmed);
}

function parseTocEntriesRegex(html: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const re = /<a\b[^>]*\bhref\s*=\s*["']#([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const id = m[1].trim();
    const label = stripTags(m[2]);
    if (!id || !label) continue;
    entries.push({ href: `#${id}`, label, level: 1 });
  }
  return entries;
}

export function extractTocTitle(tocHtml: string): string | null {
  const trimmed = tocHtml.trim();
  if (!trimmed) return null;

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(`<div>${trimmed}</div>`, "text/html");
    const root = doc.body.firstElementChild;
    const strong = root?.querySelector("p strong, p b, h2, h3");
    const text = strong?.textContent?.trim();
    if (text) return text;
  }

  const m = trimmed.match(/<p>\s*<strong>([\s\S]*?)<\/strong>/i);
  return m ? stripTags(m[1]) : null;
}
