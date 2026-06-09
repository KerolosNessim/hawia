import { plainTextFromHtml } from "@/lib/plain-text-from-html";

function normalizeComparableHeading(html: string): string {
  return plainTextFromHtml(html)
    .replace(/^[\s\d\u0660-\u0669\u06f0-\u06f9]+[.)،-]?\s*/u, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

const LEADING_BLOCK_RE =
  /^\s*<(h[1-6]|p|div|strong|span)[^>]*>([\s\S]*?)<\/\1>\s*/i;

const TRAILING_EMPTY_PARAGRAPHS_RE =
  /(?:\s*<p[^>]*>\s*(?:<br\s*\/?>)?\s*<\/p>)+\s*$/i;

/** Heading followed only by empty Lexical `<p>` blocks (common in CMS exports). */
const HEADING_WITH_TRAILING_EMPTY_RE =
  /^<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>(?:\s*<p[^>]*>\s*(?:<br\s*\/?>)?\s*<\/p>)*\s*$/i;

/**
 * CMS titles/questions are often already wrapped in h2–h4 (sometimes with trailing empty `<p>`).
 * Unwrap before rendering with `RichHtml as="h2|h3|h4"` to avoid nested headings.
 */
export function unwrapOuterHeadingBlock(html: string): string {
  let current = stripEmptyFaqMarkup(html.trim());
  if (!current) return current;

  let changed = true;
  while (changed) {
    changed = false;

    const trailingOnly = current.match(TRAILING_EMPTY_PARAGRAPHS_RE);
    if (trailingOnly) {
      current = current.slice(0, trailingOnly.index).trimEnd();
      changed = true;
      continue;
    }

    const headingWithTrailingEmpty = current.match(HEADING_WITH_TRAILING_EMPTY_RE);
    if (headingWithTrailingEmpty) {
      current = stripEmptyFaqMarkup((headingWithTrailingEmpty[1] ?? "").trim());
      changed = true;
      continue;
    }

    const fullWrap = current.match(/^<(h[1-6]|p|strong)[^>]*>([\s\S]*?)<\/\1>\s*$/i);
    if (fullWrap) {
      current = (fullWrap[2] ?? "").trim();
      changed = true;
    }
  }

  return current;
}

/** Removes empty Lexical / CMS blocks that break inline FAQ question text. */
function stripEmptyFaqMarkup(html: string): string {
  return html
    .replace(/<p[^>]*>\s*(?:&nbsp;|\u00a0|<br\s*\/?>)?\s*<\/p>/gi, " ")
    .replace(/<(span|strong)(?:\s[^>]*)?>\s*(?:&nbsp;|\u00a0)?\s*<\/\1>/gi, " ")
    .replace(/<span[^>]*>\s*<strong>\s*<span>\s*<span>\s*<\/strong>\s*<\/span>/gi, " ")
    .replace(/(?:&nbsp;|\u00a0)+$/gi, "");
}

/**
 * Cleans FAQ question HTML from CMS: drops repeated title blocks, fixes broken tags,
 * and returns plain text for accordion labels.
 */
export function sanitizeFaqQuestion(html: string): string {
  const original = html.trim();
  if (!original) return original;

  let q = stripEmptyFaqMarkup(original);
  let changed = true;
  while (changed) {
    changed = false;
    const firstBlock = q.match(LEADING_BLOCK_RE);
    if (firstBlock) {
      const label = firstBlock[2] ?? "";
      const stripped = stripLeadingDuplicateHeading(q, label);
      if (stripped !== q && stripped.trim()) {
        q = stripped;
        changed = true;
      }
    }
  }

  q = unwrapOuterHeadingBlock(stripEmptyFaqMarkup(q));

  return plainTextFromHtml(q || original).replace(/\s+/g, " ").trim();
}

/**
 * CMS editors sometimes paste the accordion/section title again as the first line
 * of the body. Remove that duplicate only when a leading block is an exact title
 * match after stripping HTML and optional numbering.
 */
export function stripLeadingDuplicateHeading(
  html: string | null | undefined,
  headingHtml: string | null | undefined,
): string {
  const expected = normalizeComparableHeading(headingHtml ?? "");
  if (!expected) return html?.trim() ?? "";

  let source = html?.trim() ?? "";
  if (!source) return source;

  let changed = true;
  while (changed) {
    changed = false;
    const firstBlock = source.match(LEADING_BLOCK_RE);
    if (firstBlock) {
      const actual = normalizeComparableHeading(firstBlock[2] ?? "");
      if (actual === expected) {
        source = source.slice(firstBlock[0].length).trim();
        changed = true;
        continue;
      }
    }

    const plainPrefix = source.match(/^([^<]+)/)?.[1]?.trim();
    if (plainPrefix) {
      const actual = normalizeComparableHeading(plainPrefix);
      if (actual === expected) {
        source = source.slice(plainPrefix.length).trim();
        changed = true;
        continue;
      }
    }

    if (normalizeComparableHeading(source) === expected) {
      return "";
    }
  }

  return source;
}

/** Removes a trailing HTML block when it matches dedicated FAQ markup. */
export function stripTrailingHtmlSuffix(html: string, suffix: string): string {
  const source = html.trim();
  const tail = suffix.trim();
  if (!source || !tail || source.length <= tail.length) return html;
  if (source.endsWith(tail)) return source.slice(0, -tail.length).trimEnd();
  return html;
}

export type FaqLikeItem = { question: string; answer: string };

/** When FAQ lives in both `content` and the dedicated `faq` field, keep one copy. */
export function stripTrailingFaqFromArticleHtml(
  articleHtml: string,
  faqItems: FaqLikeItem[],
  faqRichHtml?: string,
): string {
  if (!articleHtml.trim() || !faqItems.length) return articleHtml;

  const suffixes = new Set<string>();
  const rich = faqRichHtml?.trim();
  if (rich) suffixes.add(rich);

  suffixes.add(
    faqItems
      .map(({ question, answer }) => `${question.trim()}${answer.trim()}`)
      .join(""),
  );
  suffixes.add(
    faqItems
      .map(({ question, answer }) => {
        const q = sanitizeFaqQuestion(question);
        return `<h2>${q}</h2>${answer.trim()}`;
      })
      .join(""),
  );
  suffixes.add(
    faqItems
      .map(({ question, answer }) => {
        const q = sanitizeFaqQuestion(question);
        return `<h3>${q}</h3>${answer.trim()}`;
      })
      .join(""),
  );

  let result = articleHtml;
  for (const suffix of suffixes) {
    result = stripTrailingHtmlSuffix(result, suffix);
  }

  return result;
}

/** Removes leading h1–h6 blocks whose text matches the FAQ question. */
export function stripLeadingMatchingHeadings(
  html: string,
  question: string,
): string {
  const expected = normalizeComparableHeading(question);
  if (!expected) return html.trim();

  let source = html.trim();
  let changed = true;
  while (changed) {
    changed = false;
    const match = source.match(/^<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>\s*/i);
    if (!match) break;
    const actual = normalizeComparableHeading(match[1] ?? "");
    if (actual === expected) {
      source = source.slice(match[0].length).trim();
      changed = true;
    }
  }

  return source;
}

/** Drops a repeated plain-text question prefix from schema / excerpt text. */
export function stripQuestionPrefixFromPlainText(
  text: string,
  question: string,
): string {
  const body = text.trim();
  const q = question.trim();
  if (!body || !q) return body;

  if (normalizeComparableHeading(body) === normalizeComparableHeading(q)) {
    return "";
  }

  if (body.startsWith(q)) {
    return body.slice(q.length).replace(/^[\s:،\-–—]+/u, "").trim();
  }

  return body;
}

/** Removes embedded FAQ Q&A blocks from a section description when items are rendered separately. */
export function stripEmbeddedFaqFromSectionDescription(
  html: string,
  items: FaqLikeItem[],
): string {
  if (!html.trim() || !items.length) return html.trim();

  let result = stripTrailingFaqFromArticleHtml(html, items);
  for (const item of items) {
    const q = sanitizeFaqQuestion(item.question);
    result = stripLeadingMatchingHeadings(result, q);
    result = stripLeadingDuplicateHeading(result, q);
  }

  return result.trim();
}

export function faqDescriptionIsRedundant(
  description: string | null | undefined,
  items: FaqLikeItem[],
): boolean {
  const desc = plainTextFromHtml(description ?? "").trim();
  if (!desc) return true;

  return items.some((item) => {
    const q = sanitizeFaqQuestion(item.question);
    return q.length > 0 && desc.includes(q);
  });
}

/** Normalizes a FAQ pair for display and schema (no repeated question in answer). */
export function normalizeFaqItem(question: string, answer: string): {
  question: string;
  answer: string;
} {
  const q = sanitizeFaqQuestion(question.trim());
  let cleanedAnswer = stripLeadingDuplicateHeading(answer, q).trim();
  cleanedAnswer = stripLeadingMatchingHeadings(cleanedAnswer, q).trim();
  cleanedAnswer = stripLeadingDuplicateHeading(cleanedAnswer, q).trim();

  return {
    question: q,
    answer: cleanedAnswer,
  };
}

/** Drop duplicate FAQ rows that share the same question text. */
export function dedupeFaqItems<T extends FaqLikeItem>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeComparableHeading(sanitizeFaqQuestion(item.question));
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
