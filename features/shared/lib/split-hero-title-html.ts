function unwrapOuterWrapper(html: string): string {
  let current = html.trim();
  for (let i = 0; i < 3; i += 1) {
    const match = current.match(/^<div[^>]*>([\s\S]*)<\/div>$/i);
    if (!match) break;
    current = match[1].trim();
  }
  return current;
}

function isEmptyBlock(html: string): boolean {
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return text.length === 0;
}

function extractSiblingBlocks(html: string): string[] {
  const inner = unwrapOuterWrapper(html);
  const blockParts = inner.split(
    /(?<=<\/(?:p|div|h[1-6])>)\s*(?=<(?:p|div|h[1-6])(?:\s|>))/i,
  );
  const blocks = blockParts.map((part) => part.trim()).filter((part) => !isEmptyBlock(part));
  if (blocks.length >= 2) return blocks;

  const paragraphBlocks: string[] = [];
  const paragraphRegex = /<p\b[^>]*>[\s\S]*?<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = paragraphRegex.exec(inner)) !== null) {
    const block = match[0].trim();
    if (!isEmptyBlock(block)) paragraphBlocks.push(block);
  }
  if (paragraphBlocks.length >= 2) return paragraphBlocks;

  return [];
}

/** Multiple headings inside nested CMS wrappers (e.g. editor-div > h1 + h1). */
function extractHeadingBlocks(html: string): string[] {
  const headingRegex = /<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/gi;
  const headings: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(html)) !== null) {
    const block = match[0].trim();
    if (block) headings.push(block);
  }
  return headings;
}

/** Splits CMS hero title HTML into separate display lines. */
export function splitHeroTitleHtml(html: string): string[] {
  const trimmed = html.trim();
  if (!trimmed) return [];

  const inner = unwrapOuterWrapper(trimmed);

  const headingBlocks = extractHeadingBlocks(inner);
  if (headingBlocks.length >= 2) return headingBlocks;

  const blocks = extractSiblingBlocks(trimmed);
  if (blocks.length >= 2) return blocks;

  const brParts = inner
    .split(/<br\s*\/?>/i)
    .map((part) => part.trim())
    .filter((part) => !isEmptyBlock(part));
  if (brParts.length >= 2) return brParts;

  if (!/<[a-z][\s\S]*>/i.test(inner)) {
    const lines = inner.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    if (lines.length >= 2) return lines;
  }

  return [trimmed];
}
