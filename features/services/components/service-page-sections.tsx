"use client";

import OfferServiceSection from "@/features/services/components/offer-service-section";
import SeoFaq from "@/features/services/components/seo-faq";
import SeoPackages from "@/features/services/components/seo-packages";
import ServiceArticleTags from "@/features/services/components/service-article-tags";
import SeoSteps from "@/features/services/components/seo-steps";
import SeoTools from "@/features/services/components/seo-tools";
import ServiceClientPortfolioSection from "@/features/services/components/service-client-portfolio-section";
import { getOrderedServicePageSections } from "@/features/services/lib/collect-page-sections";
import {
  resolveSectionTone,
  sectionShellClassName,
  sectionSubtitleColor,
  type SectionTone,
  type ServicePageSurface,
} from "@/features/services/lib/section-tone";
import type {
  Benefits,
  Cta,
  Faqs,
  Section,
  ServicePageSectionInstance,
  ServicePageSectionKey,
  SingleService,
  Tools,
  ServiceClientPortfolio,
} from "@/features/services/types";
import { SectionLinkShell } from "@/features/services/components/section-link-shell";
import PageContact from "@/features/shared/components/page-contact";
import { RichHtml } from "@/features/shared/components/rich-html";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { hasSectionImage } from "@/features/services/lib/has-section-image";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import * as motion from "framer-motion/client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  service: SingleService;
  /** Sections rendered elsewhere on the page (e.g. article tags after related services). */
  excludeKeys?: ServicePageSectionKey[];
  /** First section tone index (0 = dark). Use to continue alternation after other blocks. */
  startIndex?: number;
  /** Visual shell for special pages (e.g. `/ai-services` matches home white/dark bands). */
  surface?: ServicePageSurface;
};

function sectionLinkFromData(data: { link?: string | null }): string | undefined {
  return data.link?.trim() || undefined;
}

function renderBenefitsBlock(
  benefits: Benefits,
  serviceTitle: string,
  fallbackTitle: string,
  tone: SectionTone,
) {
  const hasImage = hasSectionImage(benefits.image);
  const bodyTextClass =
    tone === "dark"
      ? "text-base leading-8 text-slate-200 [&_*]:!text-inherit [&_a]:!text-brand [&_strong]:!text-white"
      : "text-base leading-8 text-gray-600 [&_*]:!text-inherit [&_a]:!text-brand [&_strong]:!text-gray-900";

  const inner = (
    <div
      className={cn(
        "container",
        hasImage
          ? "flex flex-col items-center gap-10 lg:flex-row lg:items-center"
          : "flex flex-col items-center text-center",
      )}
    >
      <motion.div
        className={cn("w-full", hasImage ? "lg:flex-1" : "max-w-4xl")}
        initial={{ opacity: 0, x: hasImage ? -20 : 0, y: hasImage ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <RichHtml
          html={benefits.title || fallbackTitle}
          className="mb-5 text-3xl font-bold text-brand [&_*]:!text-inherit [&_h1]:!text-brand [&_h2]:!text-brand [&_h2]:text-3xl [&_h3]:!text-brand [&_h3]:text-2xl [&_p]:mb-0 [&_strong]:font-bold"
        />
        <RichHtml html={benefits.description} className={bodyTextClass} />
      </motion.div>
      {hasImage ? (
        <motion.div
          className="flex w-full flex-1 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Image
            src={benefits.image}
            alt={benefits.image_alt || plainTextFromHtml(serviceTitle)}
            width={500}
            height={500}
            className="mask-blob mx-auto h-auto w-auto drop-shadow-2xl"
            unoptimized={isRemoteMediaUrl(benefits.image)}
          />
        </motion.div>
      ) : null}
    </div>
  );

  return (
    <SectionLinkShell link={sectionLinkFromData(benefits)}>{inner}</SectionLinkShell>
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
  tone: SectionTone,
  surface: ServicePageSurface,
) {
  switch (section.key) {
    case "benefits":
      return renderBenefitsBlock(
        section.data as Benefits,
        service.title,
        t("why_seo.title"),
        tone,
      );
    case "offerings": {
      const offerings = section.data as Section;
      return <OfferServiceSection offerings={offerings} tone={tone} />;
    }
    case "steps": {
      const steps = section.data as Section;
      return (
        <SeoSteps
          steps={steps}
          tone={tone}
          layout={surface === "ai-services" && tone === "light" ? "timeline" : "cards"}
        />
      );
    }
    case "tools": {
      const tools = section.data as Tools;
      return (
        <SectionLinkShell link={sectionLinkFromData(tools)}>
          <SeoTools tools={tools} tone={tone} />
        </SectionLinkShell>
      );
    }
    case "clientPortfolio": {
      const portfolio = section.data as ServiceClientPortfolio;
      if (!portfolio.items.length) return null;
      return <ServiceClientPortfolioSection portfolio={portfolio} tone={tone} />;
    }
    case "faqs": {
      const faq = section.data as Faqs;
      return <SeoFaq faq={faq} tone={tone} />;
    }
    case "packages": {
      const packages = section.data as NonNullable<SingleService["packages"]>;
      if (!packages.items.length) return null;
      return (
        <SeoPackages
          packages={packages}
          orderPhone={service.ctas?.phone_number}
          tone={tone}
        />
      );
    }
    case "articleTags":
      return (
        <ServiceArticleTags
          tags={section.data as SingleService["articleTags"]}
          heading={t("articleTagsHeading")}
        />
      );
    case "ctas": {
      const cta = section.data as Cta;
      return (
        <SectionLinkShell link={sectionLinkFromData(cta)}>
          <PageContact
            title={cta.title}
            phone={cta.phone_number}
            description={cta.description}
            tone={tone}
          />
        </SectionLinkShell>
      );
    }
    default:
      return null;
  }
}

export function ServicePageSections({
  service,
  excludeKeys = [],
  startIndex = 0,
  surface = "default",
}: Props) {
  const t = useTranslations("singleService");
  const excluded = new Set(excludeKeys);
  const order = getOrderedServicePageSections(service.pageSections).filter(
    (section) => !excluded.has(section.key),
  );
  return (
    <>
      {order.map((section, index) => {
        const tone = resolveSectionTone(startIndex + index, surface);
        const blockKey = sectionBlockKey(section);
        const inner = renderSectionInstance(section, service, t, tone, surface);
        if (!inner) return null;
        return (
          <div
            key={blockKey}
            className={sectionShellClassName(tone, surface)}
            {...(surface === "ai-services"
              ? { "data-page-surface": "ai-services", "data-section-tone": tone }
              : {})}
          >
            <div className="relative z-10">{inner}</div>
          </div>
        );
      })}
    </>
  );
}
