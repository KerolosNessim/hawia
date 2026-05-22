import { plainTextFromHtml } from "@/lib/plain-text-from-html";

type JsonLd = Record<string, unknown>;

export type FaqJsonLdInputItem = {
  question: string;
  answer: string;
};

function toQuestionEntity(item: FaqJsonLdInputItem): JsonLd | null {
  const name = plainTextFromHtml(item.question);
  const text = plainTextFromHtml(item.answer);
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
    .map(toQuestionEntity)
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
