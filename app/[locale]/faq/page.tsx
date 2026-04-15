import PageHeader from "@/features/shared/components/page-header";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export default function FaqPage() {
  const t = useTranslations("faq");
    const s = useTranslations("singleService.faq");
    const items = s.raw("items") as { question: string; answer: string }[];
  return (
    <div className="pb-16 space-y-16">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="container">
        <div className="grid grid-cols-2 gap-4">
          <Accordion type="single" collapsible className=" gap-4">
            {items.slice(0, 5).map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Accordion type="single" collapsible className=" gap-4">
            {items.slice(5).map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
