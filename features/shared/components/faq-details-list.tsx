import { enhanceCmsHtml } from "@/lib/inline-image-alt";
import { CMS_RICH_HTML_LAYOUT_CLASSES } from "@/features/shared/lib/cms-rich-html-classes";
import {
  normalizeFaqItem,
  type FaqLikeItem,
} from "@/features/shared/lib/strip-leading-duplicate-heading";
import { cn } from "@/lib/utils";
import type { Locale } from "next-intl";

type FaqDetailsListProps = {
  items: FaqLikeItem[];
  locale: Locale;
  columns?: 1 | 2;
  className?: string;
  /** Optional FAQPage title for microdata (blog posts). */
  pageName?: string;
};

function FaqDetailsColumn({
  items,
  idPrefix,
  locale,
}: {
  items: FaqLikeItem[];
  idPrefix: string;
  locale: Locale;
}) {
  if (!items.length) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      {items.map((item, index) => {
        const normalized = normalizeFaqItem(item.question, item.answer);
        const summaryId = `${idPrefix}-summary-${index}`;
        const answerHtml = normalized.answer.trim()
          ? enhanceCmsHtml(normalized.answer, locale)
          : "";

        return (
          <details
            key={`${idPrefix}-${index}`}
            className="group overflow-hidden rounded-xl border border-brand bg-white"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <summary
              id={summaryId}
              itemProp="name"
              className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 text-start text-base font-bold text-gray-900 transition-colors outline-none hover:bg-brand/5 focus-visible:ring-2 focus-visible:ring-brand/30 sm:px-6 sm:py-5 sm:text-lg [&::-webkit-details-marker]:hidden"
            >
              <span className="flex-1">{normalized.question}</span>
              <span
                aria-hidden
                className="pointer-events-none size-5 shrink-0 text-brand transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            {answerHtml ? (
              <div
                className="border-t border-brand/50 px-5 pt-3 pb-4 text-base leading-relaxed text-gray-700 sm:px-6 sm:pt-4 sm:pb-5"
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <div
                  itemProp="text"
                  className={cn(
                    "cms-rich-html [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6",
                    CMS_RICH_HTML_LAYOUT_CLASSES,
                  )}
                  dangerouslySetInnerHTML={{ __html: answerHtml }}
                />
              </div>
            ) : null}
          </details>
        );
      })}
    </div>
  );
}

/** Server-only FAQ list — keeps FAQ data out of client component RSC props. */
export default function FaqDetailsList({
  items,
  locale,
  columns = 2,
  className,
  pageName,
}: FaqDetailsListProps) {
  if (!items.length) return null;

  const grid = columns === 1 ? (
    <div className={cn("w-full", className)}>
      <FaqDetailsColumn items={items} idPrefix="faq" locale={locale} />
    </div>
  ) : (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5",
        className,
      )}
    >
      <FaqDetailsColumn
        items={items.slice(0, Math.ceil(items.length / 2))}
        idPrefix="faq-l"
        locale={locale}
      />
      <FaqDetailsColumn
        items={items.slice(Math.ceil(items.length / 2))}
        idPrefix="faq-r"
        locale={locale}
      />
    </div>
  );

  return (
    <div itemScope itemType="https://schema.org/FAQPage">
      {pageName ? <meta itemProp="name" content={pageName} /> : null}
      {grid}
    </div>
  );
}
