import SectionHeader from '@/features/shared/components/section-header'
import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SeoFaq() {
  const t = useTranslations("singleService.faq");
  const items = t.raw("items") as { question: string; answer: string }[];
  return (
    <div className="container space-y-8">
      <SectionHeader title={t("title")} />
      <div className="grid grid-cols-2 gap-4">
      <Accordion type="single" collapsible className=" gap-4">
        {items.slice(0, 5).map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-lg font-semibold">{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Accordion type="single" collapsible className=" gap-4">
        {items.slice(5).map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-lg font-semibold">{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      </div>

    </div>
  );
}
