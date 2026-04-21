import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeader from '@/features/shared/components/section-header';
import { Faqs } from "../types";

export default function SeoFaq({faq}: {faq: Faqs}) {
  return (
    <div className="container space-y-8">
      <SectionHeader title={faq?.title} subtitle={faq?.description} subtitleColor='text-gray-500' />
      <div className="grid grid-cols-1 gap-4">
      <Accordion type="single" collapsible className=" gap-4">
        {faq?.items?.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-lg font-semibold">{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
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
