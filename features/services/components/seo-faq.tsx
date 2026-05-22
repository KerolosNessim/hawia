import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeader from '@/features/shared/components/section-header';
import { RichHtml } from "@/features/shared/components/rich-html";
import { Faqs } from "../types";

export default function SeoFaq({faq}: {faq: Faqs}) {
  return (
    <div className="container space-y-8">
      <SectionHeader
        titleHtml={faq?.title}
        subtitleHtml={faq?.description}
        subtitleColor="text-gray-500"
      />
      <div className="grid grid-cols-1 gap-4">
      <Accordion type="single" collapsible className=" gap-4">
        {faq?.items?.map((item, index) => (
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

      {/* <Accordion type="single" collapsible className=" gap-4">
        {items.slice(5).map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-lg font-semibold">{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion> */}
      </div>

    </div>
  );
}
