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

/** CMS FAQ questions are often wrapped in h2–h4; unwrap for accordion labels. */
export function unwrapOuterHeadingBlock(html: string): string {
  let current = html.trim();
  if (!current) return current;

  let changed = true;
  while (changed) {
    changed = false;
    const match = current.match(/^<(h[1-6]|p|strong)[^>]*>([\s\S]*?)<\/\1>\s*$/i);
    if (match) {
      current = (match[2] ?? "").trim();
      changed = true;
    }
  }

  return current;
}

/**
 * Cleans FAQ question HTML from CMS: drops repeated title blocks, fixes broken tags,
 * and returns plain text for simple one-line questions (accordion labels).
 */
export function sanitizeFaqQuestion(html: string): string {
  const original = html.trim();
  if (!original) return original;

  let q = original;
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

  q = unwrapOuterHeadingBlock(q);

  const plain = plainTextFromHtml(q || original).replace(/\s+/g, " ").trim();
  if (!plain) return original;

  const hasRichContent =
    /<(ul|ol|table|h[1-6]|img|iframe|video|blockquote|div)\b/i.test(q);
  if (!hasRichContent) return plain;

  return q.trim() || plain;
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

/** Normalizes a FAQ pair for display and schema (no repeated question in answer). */
export function normalizeFaqItem(question: string, answer: string): {
  question: string;
  answer: string;
} {
  const q = sanitizeFaqQuestion(question.trim());
  return {
    question: q,
    answer: stripLeadingDuplicateHeading(answer, q).trim(),
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
