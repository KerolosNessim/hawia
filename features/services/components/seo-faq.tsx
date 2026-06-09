import FaqDetailsList from "@/features/shared/components/faq-details-list";
import SectionHeader from "@/features/shared/components/section-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { SectionLinkShell } from "@/features/services/components/section-link-shell";
import {
  faqDescriptionIsRedundant,
  normalizeFaqItem,
  stripLeadingDuplicateHeading,
} from "@/features/shared/lib/strip-leading-duplicate-heading";
import { sectionHeaderProps } from "../lib/section-tone";
import type { SectionTone } from "../lib/section-tone";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { cn } from "@/lib/utils";
import type { Locale } from "next-intl";
import { Faqs } from "../types";

export default function SeoFaq({
  faq,
  locale,
  tone = "light",
}: {
  faq: Faqs;
  locale: Locale;
  tone?: SectionTone;
}) {
  const linkedItems = faq?.items?.filter((item) => item.link?.trim()) ?? [];
  const accordionItems =
    faq?.items?.filter((item) => !item.link?.trim()) ?? [];
  const allItems = faq?.items ?? [];
  const subtitleHtml = faqDescriptionIsRedundant(faq?.description, allItems)
    ? undefined
    : faq?.description;

  return (
    <div className="container space-y-8">
      <SectionHeader
        titleHtml={faq?.title}
        subtitleHtml={subtitleHtml}
        {...sectionHeaderProps(tone)}
      />
      <div className="grid grid-cols-1 gap-4">
        {linkedItems.length > 0 ? (
          <div className="flex flex-col gap-4">
            {linkedItems.map((item, index) => {
              const normalized = normalizeFaqItem(item.question, item.answer);
              const questionHtml = stripLeadingDuplicateHeading(
                item.question,
                normalized.question,
              );

              return (
                <SectionLinkShell
                  key={`linked-${index}`}
                  link={item.link}
                  className={cn(
                    "block rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md",
                    tone === "dark"
                      ? "border-white/15 bg-gray-800/80"
                      : "border-border/70 bg-card",
                  )}
                >
                  <RichHtml
                    html={questionHtml}
                    as="h3"
                    className="mb-3 text-lg font-semibold text-start [&_p]:mb-0"
                  />
                  <RichHtml
                    html={normalized.answer}
                    className={tone === "dark" ? "text-gray-300" : "text-muted-foreground"}
                  />
                </SectionLinkShell>
              );
            })}
          </div>
        ) : null}

        {accordionItems.length > 0 ? (
          <FaqDetailsList
            locale={locale}
            items={accordionItems}
            columns={accordionItems.length > 1 ? 2 : 1}
            pageName={plainTextFromHtml(faq?.title) || undefined}
            useMicrodata
          />
        ) : null}
      </div>
    </div>
  );
}
