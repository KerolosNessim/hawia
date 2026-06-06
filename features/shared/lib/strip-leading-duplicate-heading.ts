import { plainTextFromHtml } from "@/lib/plain-text-from-html";

function normalizeComparableHeading(html: string): string {
  return plainTextFromHtml(html)
    .replace(/^[\s\d\u0660-\u0669\u06f0-\u06f9]+[.)،-]?\s*/u, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

/**
 * CMS editors sometimes paste the accordion title again as the first line
 * of the answer. Remove that duplicate only when the first block is an
 * exact title match after stripping HTML and optional numbering.
 */
export function stripLeadingDuplicateHeading(
  html: string | null | undefined,
  headingHtml: string | null | undefined,
): string {
  const source = html?.trim() ?? "";
  const expected = normalizeComparableHeading(headingHtml ?? "");
  if (!source || !expected) return source;

  const firstBlock = source.match(/^<(h[1-6]|p|div)[^>]*>([\s\S]*?)<\/\1>\s*/i);
  if (firstBlock) {
    const actual = normalizeComparableHeading(firstBlock[2] ?? "");
    return actual === expected ? source.slice(firstBlock[0].length).trim() : source;
  }

  return normalizeComparableHeading(source) === expected ? "" : source;
}
