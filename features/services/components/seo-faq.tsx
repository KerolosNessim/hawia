import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeader from '@/features/shared/components/section-header';
import { RichHtml } from "@/features/shared/components/rich-html";
import { SectionLinkShell } from "@/features/services/components/section-link-shell";
import { sectionSubtitleColor } from "../lib/section-tone";
import type { SectionTone } from "../lib/section-tone";
import { cn } from "@/lib/utils";
import { Faqs } from "../types";

export default function SeoFaq({
  faq,
  tone = "light",
}: {
  faq: Faqs;
  tone?: SectionTone;
}) {
  const linkedItems = faq?.items?.filter((item) => item.link?.trim()) ?? [];
  const accordionItems =
    faq?.items?.filter((item) => !item.link?.trim()) ?? [];

  return (
    <div className="container space-y-8">
      <SectionHeader
        titleHtml={faq?.title}
        subtitleHtml={faq?.description}
        subtitleColor={sectionSubtitleColor(tone)}
      />
      <div className="grid grid-cols-1 gap-4">
        {linkedItems.length > 0 ? (
          <div className="flex flex-col gap-4">
            {linkedItems.map((item, index) => (
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
                  html={item.question}
                  as="h3"
                  className="mb-3 text-lg font-semibold text-start [&_p]:mb-0"
                />
                <RichHtml
                  html={item.answer}
                  className={tone === "dark" ? "text-gray-300" : "text-muted-foreground"}
                />
              </SectionLinkShell>
            ))}
          </div>
        ) : null}

        {accordionItems.length > 0 ? (
          <Accordion type="single" collapsible className="gap-4">
            {accordionItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-start [&_svg]:shrink-0">
                  <RichHtml
                    html={item.question}
                    as="span"
                    className="flex-1 pe-2 text-start [&_p]:mb-0 [&_h2]:text-lg [&_h3]:text-base [&_strong]:font-semibold"
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <RichHtml html={item.answer} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : null}
      </div>
    </div>
  );
}
