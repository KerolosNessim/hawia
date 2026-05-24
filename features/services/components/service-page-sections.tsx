"use client";

import OfferServiceSection from "@/features/services/components/offer-service-section";
import SeoFaq from "@/features/services/components/seo-faq";
import SeoPackages from "@/features/services/components/seo-packages";
import ServiceArticleTags from "@/features/services/components/service-article-tags";
import SeoSteps from "@/features/services/components/seo-steps";
import SeoTools from "@/features/services/components/seo-tools";
import {
  getOrderedServicePageSectionKeys,
  type ServicePageSectionKey,
} from "@/features/services/lib/service-section-order";
import type { SingleService } from "@/features/services/types";
import PageContact from "@/features/shared/components/page-contact";
import { RichHtml } from "@/features/shared/components/rich-html";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import * as motion from "framer-motion/client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  service: SingleService;
};

export function ServicePageSections({ service }: Props) {
  const t = useTranslations("singleService");
  const order = getOrderedServicePageSectionKeys(service);

  const renderSection = (key: ServicePageSectionKey) => {
    switch (key) {
      case "benefits":
        if (!service.benefits) return null;

        console.log('service.benefits', service.benefits)
        return (
          <div
            key={key}
            className={cn("container flex flex-col items-center gap-10 lg:flex-row lg:items-center", !service.benefits.image && "items-center")}
          >
            <motion.div
              className={cn("w-full lg:flex-1", !service.benefits.image && "text-center")}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <RichHtml
                html={service.benefits.title || t("why_seo.title")}
                className="mb-4 text-3xl font-bold text-brand [&_p]:mb-0 [&_h2]:text-3xl [&_h3]:text-2xl [&_strong]:font-bold"
              />
              <RichHtml html={service.benefits.description} />
            </motion.div>
            {service.benefits.image && <motion.div
              className="flex w-full flex-1 justify-center max-lg:hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Image
                src={service.benefits.image || "/whySeo.webp"}
                alt={
                  service.benefits.image_alt ||
                  plainTextFromHtml(service.title)
                }
                width={500}
                height={500}
                className="mask-blob mx-auto h-auto w-auto"
                unoptimized={isRemoteMediaUrl(service.benefits.image || "")}
              />
            </motion.div>}
          </div>
        );
      case "offerings":
        return service.offerings ? (
          <OfferServiceSection key={key} offerings={service.offerings} />
        ) : null;
      case "steps":
        return service.steps ? (
          <SeoSteps key={key} steps={service.steps} />
        ) : null;
      case "tools":
        return service.tools ? (
          <SeoTools key={key} tools={service.tools} />
        ) : null;
      case "faqs":
        return service.faqs ? <SeoFaq key={key} faq={service.faqs} /> : null;
      case "packages":
        return service.packages?.items.length ? (
          <SeoPackages
            key={key}
            packages={service.packages}
            orderPhone={service.ctas?.phone_number}
          />
        ) : null;
      case "articleTags":
        return service.articleTags.length ? (
          <ServiceArticleTags
            key={key}
            tags={service.articleTags}
            heading={t("articleTagsHeading")}
          />
        ) : null;
      case "ctas":
        return service.ctas ? (
          <PageContact
            key={key}
            title={service.ctas.title}
            phone={service.ctas.phone_number}
            description={service.ctas.description}
          />
        ) : null;
      default:
        return null;
    }
  };

  return <>{order.map((key) => renderSection(key))}</>;
}
