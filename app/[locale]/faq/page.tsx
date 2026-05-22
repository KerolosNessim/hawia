import PageHeader from "@/features/shared/components/page-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { localePath } from "@/features/blogs/lib/blog-routes";
import { buildBreadcrumbJsonLd, jsonLdScript } from "@/features/blogs/lib/json-ld";
import { buildFaqPageJsonLd } from "@/features/shared/lib/faq-json-ld";
import { getFaqData } from "@/features/home/services/faq";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { getAbsoluteUrl, localePathname } from "@/lib/seo/metadata-helpers";
import { buildStaticPageMetadata } from "@/lib/seo/settings-page-seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations("faq");

  try {
    const response = await getFaqData();
    const data = response.data;

    return buildStaticPageMetadata({
      locale: loc,
      pathname: localePathname(loc, "/faq"),
      pageKey: "faq",
      title: data.meta_title || data.title,
      description: data.meta_description || data.description,
    });
  } catch {
    return buildStaticPageMetadata({
      locale: loc,
      pathname: localePathname(loc, "/faq"),
      pageKey: "faq",
      title: t("title"),
      description: t("description"),
    });
  }
}

export default async function FaqPage() {
  const t = await getTranslations("faq");
  const locale = (await getLocale()) as Locale;

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

  const pageTitle = data.title || t("title");
  const faqPath = localePath(locale, "/faq");
  const pageAbs = await getAbsoluteUrl(faqPath);
  const homeAbs = await getAbsoluteUrl(localePath(locale, "/"));

  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: t("breadcrumbHome"), url: homeAbs },
    { name: t("breadcrumbFaq"), url: pageAbs },
  ]);

  const faqLd = buildFaqPageJsonLd({
    items: items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
    url: pageAbs,
    name: plainTextFromHtml(pageTitle) || t("title"),
  });

  const structuredData = jsonLdScript(
    faqLd ? [breadcrumbLd, faqLd] : [breadcrumbLd],
  );

  return (
    <div className="pb-16 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <PageHeader
        title={data.title || t("title")}
        descriptionHtml={data.description || t("description")}
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
                    <RichHtml html={item.answer} />
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
                    <RichHtml html={item.answer} />
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
