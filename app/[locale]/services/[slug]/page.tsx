import OfferServiceSection from "@/features/services/components/offer-service-section";
import SeoFaq from "@/features/services/components/seo-faq";
import SeoPackages from "@/features/services/components/seo-packages";
import ServiceArticleTags from "@/features/services/components/service-article-tags";
import SeoSteps from "@/features/services/components/seo-steps";
import SeoTools from "@/features/services/components/seo-tools";
import { buildServiceMetadata } from "@/features/services/lib/service-metadata";
import { getSingleService } from "@/features/services/services/get-single-service";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import PageContact from "@/features/shared/components/page-contact";
import PageHeader from "@/features/shared/components/page-header";
import * as motion from "framer-motion/client";
import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { redirectToNotFound } from "@/features/shared/lib/redirect-to-not-found";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await getSingleService(slug, locale);
  if (!res?.data) return { title: "Service", robots: { index: false, follow: false } };
  return buildServiceMetadata(res.data, locale);
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("singleService");
  const res = await getSingleService(slug, locale);
  if (!res?.data) redirectToNotFound();
  const service = res.data;

  return (
    <div>
      <PageHeader
        title={service.title || t("title")}
        descriptionHtml={service.inside_desc || t("description")}
        image={service.image || "/whySeo.webp"}
      />
      <div className="space-y-16 py-16">
        {service.highlight_description ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            dangerouslySetInnerHTML={{ __html: service.highlight_description }}
            className="container space-y-4 rounded-xl bg-gray-900 p-6 text-center leading-loose text-white"
          />
        ) : null}

        {service.benefits ? (
          <div className="container flex items-center justify-center gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-bold text-brand">
                {service.benefits.title || t("why_seo.title")}
              </h2>
              <div dangerouslySetInnerHTML={{ __html: service.benefits.description || "" }} />
            </motion.div>
            <motion.div
              className="w-2/3 max-lg:hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Image
                src={service.benefits.image || "/whySeo.webp"}
                alt={service.benefits.image_alt || service.title}
                width={500}
                height={500}
                className="mask-blob h-auto w-auto"
                unoptimized={isRemoteMediaUrl(service.benefits.image || "")}
              />
            </motion.div>
          </div>
        ) : null}

        {service.offerings ? <OfferServiceSection offerings={service.offerings} /> : null}

        {service.steps ? <SeoSteps steps={service.steps} /> : null}

        {service.tools ? <SeoTools tools={service.tools} /> : null}

        {service.faqs ? <SeoFaq faq={service.faqs} /> : null}

        {service.packages?.items.length ? (
          <SeoPackages packages={service.packages} orderPhone={service.ctas?.phone_number} />
        ) : null}

        {service.articleTags.length ? (
          <ServiceArticleTags tags={service.articleTags} heading={t("articleTagsHeading")} />
        ) : null}

        {service.ctas ? (
          <PageContact
            title={service.ctas.title}
            phone={service.ctas.phone_number}
            description={service.ctas.description}
          />
        ) : null}
      </div>
    </div>
  );
}
