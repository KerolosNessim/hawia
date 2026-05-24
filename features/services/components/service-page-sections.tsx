"use client";

import OfferServiceSection from "@/features/services/components/offer-service-section";
import SeoFaq from "@/features/services/components/seo-faq";
import SeoPackages from "@/features/services/components/seo-packages";
import ServiceArticleTags from "@/features/services/components/service-article-tags";
import SeoSteps from "@/features/services/components/seo-steps";
import SeoTools from "@/features/services/components/seo-tools";
import { getOrderedServicePageSections } from "@/features/services/lib/collect-page-sections";
import type {
  Benefits,
  Cta,
  Faqs,
  Section,
  ServicePageSectionInstance,
  SingleService,
  Tools,
} from "@/features/services/types";
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

function renderBenefitsBlock(
  benefits: Benefits,
  serviceTitle: string,
  fallbackTitle: string,
  blockKey: string,
) {
  return (
    <div
      key={blockKey}
      className={cn(
        "container flex flex-col items-center gap-10 lg:flex-row lg:items-center",
        !benefits.image && "items-center",
      )}
    >
      <motion.div
        className={cn("w-full lg:flex-1", !benefits.image && "text-center")}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <RichHtml
          html={benefits.title || fallbackTitle}
          className="mb-4 text-3xl font-bold text-brand [&_p]:mb-0 [&_h2]:text-3xl [&_h3]:text-2xl [&_strong]:font-bold"
        />
        <RichHtml html={benefits.description} />
      </motion.div>
      {benefits.image ? (
        <motion.div
          className="flex w-full flex-1 justify-center max-lg:hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Image
            src={benefits.image || "/whySeo.webp"}
            alt={benefits.image_alt || plainTextFromHtml(serviceTitle)}
            width={500}
            height={500}
            className="mask-blob mx-auto h-auto w-auto"
            unoptimized={isRemoteMediaUrl(benefits.image || "")}
          />
        </motion.div>
      ) : null}
    </div>
  );
}

function sectionBlockKey(section: ServicePageSectionInstance): string {
  const data = section.data as { id?: number };
  if (typeof data?.id === "number" && data.id > 0) {
    return `${section.key}-${data.id}`;
  }
  return `${section.key}-${section.index}`;
}

function renderSectionInstance(
  section: ServicePageSectionInstance,
  service: SingleService,
  t: ReturnType<typeof useTranslations>,
) {
  const blockKey = sectionBlockKey(section);

  switch (section.key) {
    case "benefits":
      return renderBenefitsBlock(
        section.data as Benefits,
        service.title,
        t("why_seo.title"),
        blockKey,
      );
    case "offerings":
      return (
        <OfferServiceSection
          key={blockKey}
          offerings={section.data as Section}
        />
      );
    case "steps":
      return <SeoSteps key={blockKey} steps={section.data as Section} />;
    case "tools":
      return <SeoTools key={blockKey} tools={section.data as Tools} />;
    case "faqs":
      return <SeoFaq key={blockKey} faq={section.data as Faqs} />;
    case "packages": {
      const packages = section.data as NonNullable<SingleService["packages"]>;
      return packages.items.length ? (
        <SeoPackages
          key={blockKey}
          packages={packages}
          orderPhone={service.ctas?.phone_number}
        />
      ) : null;
    }
    case "articleTags":
      return (
        <ServiceArticleTags
          key={blockKey}
          tags={section.data as SingleService["articleTags"]}
          heading={t("articleTagsHeading")}
        />
      );
    case "ctas": {
      const cta = section.data as Cta;
      return (
        <PageContact
          key={blockKey}
          title={cta.title}
          phone={cta.phone_number}
          description={cta.description}
        />
      );
    }
    default:
      return null;
  }
}

export function ServicePageSections({ service }: Props) {
  const t = useTranslations("singleService");
  const order = getOrderedServicePageSections(service.pageSections);

  return <>{order.map((section) => renderSectionInstance(section, service, t))}</>;
}
