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
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  service: SingleService;
  /** Sections rendered elsewhere on the page (e.g. article tags after related services). */
  excludeKeys?: ServicePageSectionKey[];
  /** First section tone index (0 = dark). Use to continue alternation after other blocks. */
  startIndex?: number;
  /** Visual shell for special pages (e.g. `/ai-services` matches home white/dark bands). */
  surface?: ServicePageSurface;
  /** Insert a block after the section at this index (0 = after the first section). */
  insertAfterIndex?: number;
  insertion?: ReactNode;
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
          : "flex flex-col items-center",
      )}
    >
      <div className={cn("w-full", hasImage ? "lg:flex-1" : "max-w-4xl")}>
        <RichHtml
          html={benefits.title || fallbackTitle}
          className={cn(
            "mb-5 text-3xl font-bold text-brand [&_*]:!text-inherit [&_h1]:!text-brand [&_h2]:!text-brand [&_h2]:text-3xl [&_h3]:!text-brand [&_h3]:text-2xl [&_p]:mb-0 [&_strong]:font-bold",
            !hasImage && "text-center",
          )}
        />
        <RichHtml
          html={benefits.description}
          className={cn(bodyTextClass, !hasImage && "text-center")}
        />
      </div>
      {hasImage ? (
        <div className="flex w-full flex-1 justify-center">
          <Image
            src={benefits.image}
            alt={benefits.image_alt || plainTextFromHtml(serviceTitle)}
            width={500}
            height={500}
            className="mask-blob mx-auto h-auto w-auto drop-shadow-2xl"
            unoptimized={isRemoteMediaUrl(benefits.image)}
          />
        </div>
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
  t: Awaited<ReturnType<typeof getTranslations>>,
  locale: Locale,
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
      return <SeoFaq faq={faq} locale={locale} tone={tone} />;
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

function sectionShell(
  key: string,
  tone: SectionTone,
  surface: ServicePageSurface,
  children: ReactNode,
) {
  return (
    <div
      key={key}
      className={sectionShellClassName(tone, surface)}
      {...(surface === "ai-services"
        ? { "data-page-surface": "ai-services", "data-section-tone": tone }
        : {})}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export async function ServicePageSections({
  service,
  excludeKeys = [],
  startIndex = 0,
  surface = "default",
  insertAfterIndex,
  insertion,
  locale,
}: Props & { locale: Locale }) {
  const t = await getTranslations("singleService");
  const excluded = new Set(excludeKeys);
  const order = getOrderedServicePageSections(service.pageSections).filter(
    (section) => !excluded.has(section.key),
  );

  const nodes: ReactNode[] = [];
  let bandIndex = 0;

  const pushInsertion = (key: string) => {
    if (insertion == null || insertAfterIndex == null) return;
    nodes.push(
      <div key={key} className="w-full py-16 md:py-20">
        {insertion}
      </div>,
    );
    bandIndex += 1;
  };

  if (order.length === 0 && insertion != null && insertAfterIndex === 0) {
    pushInsertion("section-insertion");
    return <>{nodes}</>;
  }

  let faqSectionRendered = false;

  order.forEach((section, index) => {
    if (section.key === "faqs") {
      if (faqSectionRendered) return;
      faqSectionRendered = true;
    }

    const tone = resolveSectionTone(startIndex + bandIndex, surface);
    const blockKey = sectionBlockKey(section);
    const inner = renderSectionInstance(section, service, t, locale, tone, surface);
    if (inner) {
      nodes.push(sectionShell(blockKey, tone, surface, inner));
      bandIndex += 1;
    }

    if (insertion != null && insertAfterIndex === index) {
      pushInsertion(`section-insertion-after-${blockKey}`);
    }
  });

  return <>{nodes}</>;
}
