import {
  dedupeFaqItems,
  normalizeFaqItem,
  stripQuestionPrefixFromPlainText,
} from "@/features/shared/lib/strip-leading-duplicate-heading";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";

type JsonLd = Record<string, unknown>;

export type FaqJsonLdInputItem = {
  question: string;
  answer: string;
};

/** Matches opening/closing heading tags at the same level (h2–h4). */
const FAQ_HEADING_RE = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi;

/**
 * Splits CMS FAQ rich HTML into Q/A pairs.
 * Each h2–h4 heading is a question; following markup until the next heading is the answer.
 */
export function parseFaqPairsFromRichHtml(faqHtml: string): FaqJsonLdInputItem[] {
  const trimmed = faqHtml.trim();
  if (!trimmed) return [];

  const headings: { start: number; end: number; questionHtml: string }[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(FAQ_HEADING_RE.source, FAQ_HEADING_RE.flags);
  while ((match = re.exec(trimmed)) !== null) {
    headings.push({
      start: match.index,
      end: match.index + match[0].length,
      questionHtml: match[2] ?? "",
    });
  }

  if (!headings.length) return [];

  return dedupeFaqItems(
    headings.map((heading, i) =>
      normalizeFaqItem(
        heading.questionHtml,
        trimmed.slice(
          heading.end,
          i + 1 < headings.length ? headings[i + 1].start : trimmed.length,
        ),
      ),
    ),
  );
}

export function faqItemToSchemaEntity(item: FaqJsonLdInputItem): JsonLd | null {
  const { question, answer } = normalizeFaqItem(item.question, item.answer);
  const name = plainTextFromHtml(question);
  const text = stripQuestionPrefixFromPlainText(plainTextFromHtml(answer), name);
  if (!name || !text) return null;

  return {
    "@type": "Question",
    name,
    acceptedAnswer: {
      "@type": "Answer",
      text,
    },
  };
}

/**
 * Builds schema.org `FAQPage` JSON-LD from CMS FAQ items (HTML question/answer supported).
 * Returns `null` when there are no valid Q&A pairs.
 */
export function buildFaqPageJsonLd(opts: {
  items: FaqJsonLdInputItem[];
  url?: string;
  name?: string;
}): JsonLd | null {
  const mainEntity = opts.items
    .map(faqItemToSchemaEntity)
    .filter((entry): entry is JsonLd => entry != null);

  if (!mainEntity.length) return null;

  const page: JsonLd = {
    "@type": "FAQPage",
    mainEntity,
  };

  if (opts.url) page.url = opts.url;
  if (opts.name) page.name = opts.name;

  return page;
}
