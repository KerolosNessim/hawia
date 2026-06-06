import FaqAccordion from "@/features/shared/components/faq-accordion";
import PageHeader from "@/features/shared/components/page-header";
import { PageSchemaScript } from "@/features/shared/components/seo/page-schema-script";
import { stripLeadingDuplicateHeading } from "@/features/shared/lib/strip-leading-duplicate-heading";
import { buildCanonicalUrl, serializeFaqPageSchema } from "@/lib/seo/schema";
import { getFaqData } from "@/features/home/services/faq";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { localePathname } from "@/lib/seo/metadata-helpers";
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

  const items = (data.items || []).map((item) => ({
    ...item,
    answer: stripLeadingDuplicateHeading(item.answer, item.question),
  }));
  const pageTitle = data.title || t("title");
  const pageAbs = buildCanonicalUrl(locale, "/faq");
  const faqSchemaJson = serializeFaqPageSchema({
    pageUrl: pageAbs,
    name: plainTextFromHtml(pageTitle) || t("title"),
    description: data.meta_description || data.description || t("description"),
    inLanguage: locale === "ar" ? "ar" : "en",
    breadcrumbs: [
      { name: t("breadcrumbHome"), url: buildCanonicalUrl(locale, "/") },
      { name: t("breadcrumbFaq"), url: pageAbs },
    ],
    faqItems: items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  });

  return (
    <div className="pb-16 space-y-16">
      <PageSchemaScript json={faqSchemaJson} />
      <PageHeader
        title={data.title || t("title")}
        descriptionHtml={data.description || t("description")}
      />
      <div className="container">
        <FaqAccordion
          items={items.map((item) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
          }))}
          columns={2}
        />
      </div>
    </div>
  );
}
