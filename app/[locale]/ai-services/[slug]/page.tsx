import PageHeader from "@/features/shared/components/page-header";
import { getSingleServiceAiAsService } from "@/features/services/services/get-service-ais";
import { ServicePageSections } from "@/features/services/components/service-page-sections";
import ServiceArticleTags from "@/features/services/components/service-article-tags";
import ServicePageScript from "@/features/services/components/service-page-script";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import { RichHtml } from "@/features/shared/components/rich-html";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import * as motion from "framer-motion/client";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const res = await getSingleServiceAiAsService(slug, locale);
  if (!res?.data) {
    return { title: "AI Service", robots: { index: false, follow: false } };
  }
  const d = res.data;
  const cleanTitle = plainTextFromHtml(d.meta_title ?? d.singlePageTitle ?? d.title).trim();
  const cleanDescription = plainTextFromHtml(
    d.meta_description ?? d.description ?? d.inside_desc ?? "",
  ).trim();
  return {
    title: cleanTitle || "AI Service",
    description: cleanDescription || undefined,
    robots: { index: true, follow: true },
  };
}

export default async function AiServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const res = await getSingleServiceAiAsService(slug, locale);
  if (!res?.data) redirectToNotFound();

  const service = res.data;
  const t = await getTranslations("singleService");
  const heroTitle = plainTextFromHtml(service.singlePageTitle || service.title).trim() || t("title");
  const heroDescriptionHtml =
    service.subtitle?.trim() ||
    service.inside_desc ||
    service.description ||
    t("description");
  const heroImage = service.image || "/whySeo.webp";

  return (
    <div>
      {service.pageScript ? <ServicePageScript scriptHtml={service.pageScript} /> : null}

      <PageHeader
        titleHtml={service.singlePageTitle || service.title || heroTitle}
        descriptionAsHeader
        descriptionHtml={heroDescriptionHtml}
        image={heroImage}
        imageAlt={service.image_alt || ""}
      />

      {service.description?.trim() && service.pageSections.length === 0 ? (
        <div className="container py-12">
          <RichHtml
            html={service.description}
            className="cms-rich-html max-w-4xl mx-auto space-y-4"
          />
        </div>
      ) : null}

      <div className="space-y-16 py-16">
        {service.highlight_description ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="container rounded-xl bg-gray-900 p-6 text-center leading-loose text-white"
          >
            <RichHtml html={service.highlight_description} className="space-y-4" />
          </motion.div>
        ) : null}

        <ServicePageSections service={service} excludeKeys={["articleTags"]} />
      </div>

      {service.articleTags.length > 0 ? (
        <div className="space-y-16 pb-16">
          <ServiceArticleTags tags={service.articleTags} heading={t("articleTagsHeading")} />
        </div>
      ) : null}
    </div>
  );
}

