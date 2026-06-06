"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RichHtml } from "@/features/shared/components/rich-html";
import { cn } from "@/lib/utils";

export type FaqAccordionItem = {
  id?: string | number;
  question: string;
  answer: string;
};

type FaqAccordionColumnProps = {
  items: FaqAccordionItem[];
  valuePrefix: string;
  allowHtml?: boolean;
  contentClassName?: string;
};

function FaqAccordionColumn({
  items,
  valuePrefix,
  allowHtml = true,
  contentClassName,
}: FaqAccordionColumnProps) {
  if (!items.length) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => {
        const value =
          item.id != null ? `${valuePrefix}-${item.id}` : `${valuePrefix}-${index}`;

        return (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger>
              {allowHtml ? (
                <RichHtml
                  html={item.question}
                  as="span"
                  className="[&_h2]:text-lg [&_h3]:text-base [&_p]:mb-0 [&_strong]:font-bold"
                />
              ) : (
                item.question
              )}
            </AccordionTrigger>
            <AccordionContent className={contentClassName}>
              {allowHtml ? (
                <RichHtml
                  html={item.answer}
                  className="cms-rich-html [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6"
                />
              ) : (
                item.answer
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

type FaqAccordionProps = {
  items: FaqAccordionItem[];
  columns?: 1 | 2;
  className?: string;
  allowHtml?: boolean;
  contentClassName?: string;
};

export default function FaqAccordion({
  items,
  columns = 2,
  className,
  allowHtml = true,
  contentClassName,
}: FaqAccordionProps) {
  if (!items.length) return null;

  if (columns === 1) {
    return (
      <div className={cn("w-full", className)}>
        <FaqAccordionColumn
          items={items}
          valuePrefix="faq"
          allowHtml={allowHtml}
          contentClassName={contentClassName}
        />
      </div>
    );
  }

  const midPoint = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, midPoint);
  const rightItems = items.slice(midPoint);

  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5",
        className,
      )}
    >
      <FaqAccordionColumn
        items={leftItems}
        valuePrefix="faq-l"
        allowHtml={allowHtml}
        contentClassName={contentClassName}
      />
      <FaqAccordionColumn
        items={rightItems}
        valuePrefix="faq-r"
        allowHtml={allowHtml}
        contentClassName={contentClassName}
      />
    </div>
  );
}
