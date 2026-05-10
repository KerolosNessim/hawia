import PageHeader from "@/features/shared/components/page-header";
import { getTranslations } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFaqData } from "@/features/home/services/faq";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  await params;
  try {
    const response = await getFaqData();
    const data = response.data;
    
    return {
      title: data.meta_title || data.title,
      description: data.meta_description || data.description,
    };
  } catch (error) {
    return {
      title: "FAQs",
    };
  }
}

export default async function FaqPage() {
  const t = await getTranslations("faq");
  
  let data;
  try {
    const response = await getFaqData();
    data = response.data;
  } catch (error) {
    console.error("Failed to fetch FAQ data:", error);
    return null;
  }

  const items = data.items || [];
  const midPoint = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, midPoint);
  const rightItems = items.slice(midPoint);

  return (
    <div className="pb-16 space-y-16">
      <PageHeader 
        title={data.title || t("title")} 
        description={data.description || t("description")} 
      />
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {leftItems.map((item) => (
                <AccordionItem key={item.id} value={`item-${item.id}`} className="border-brand/20 bg-white/5 backdrop-blur-sm rounded-2xl px-4 border">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline text-brand">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {rightItems.map((item) => (
                <AccordionItem key={item.id} value={`item-${item.id}`} className="border-brand/20 bg-white/5 backdrop-blur-sm rounded-2xl px-4 border">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline text-brand">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
