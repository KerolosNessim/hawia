"use client";

import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { ServiceSectionItemCard } from "@/features/services/components/service-section-item-card";
import { resolveSectionCardIcon } from "@/features/services/lib/section-card-icons";
import { hasSectionImage } from "@/features/services/lib/has-section-image";
import SectionHeader from "@/features/shared/components/section-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { sectionItemCardClassName, sectionSubtitleColor } from "../lib/section-tone";
import type { SectionTone } from "../lib/section-tone";
import { orderSectionItemsForDisplay } from "../lib/section-items-display-order";
import type { Section, SectionItem } from "../types";

type Layout = "cards" | "timeline";

function StepTimelineItem({
  item,
  index,
  isRTL,
  isLast,
}: {
  item: SectionItem;
  index: number;
  isRTL: boolean;
  isLast: boolean;
}) {
  const Icon = resolveSectionCardIcon(item.icon);
  const stepNumber = String(index + 1).padStart(2, "0");
  const isUp = index % 2 === 0;

  return (
    <div className="flex flex-1 items-center relative">
      <div
        className={cn(
          "flex w-full flex-col items-center text-center",
          "lg:translate-y-0",
          isUp ? "lg:-translate-y-14" : "lg:translate-y-14",
        )}
      >
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          {Icon ? (
            <Icon className="h-10 w-10 text-brand" aria-hidden />
          ) : null}
        </div>
        <div className="mt-6 flex flex-col items-center">
          <span className="text-4xl font-black leading-none text-brand">{stepNumber}</span>
          <RichHtml
            html={item.title}
            as="h3"
            className="mt-3 text-xl font-bold text-brand [&_p]:mb-0"
          />
          <RichHtml
            html={item.description}
            className="mt-2 max-w-[180px] text-sm leading-relaxed text-gray-600 [&_p]:mb-0"
          />
        </div>
      </div>
      {!isLast ? (
        <div
          className="hidden shrink-0 lg:block"
          style={{ left: isRTL ? "auto" : "100%", right: isRTL ? "100%" : "auto" }}
        >
          {isRTL ? (
            <ArrowLeft className="h-8 w-8 text-gray-300" aria-hidden />
          ) : (
            <ArrowRight className="h-8 w-8 text-gray-300" aria-hidden />
          )}
        </div>
      ) : null}
    </div>
  );
}

function StepTimelineMobileItem({
  item,
  index,
  isLast,
}: {
  item: SectionItem;
  index: number;
  isLast: boolean;
}) {
  const Icon = resolveSectionCardIcon(item.icon);
  const stepNumber = String(index + 1).padStart(2, "0");

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-white shadow-xl">
        {Icon ? (
          <Icon className="h-10 w-10 text-brand" aria-hidden />
        ) : null}
      </div>
      <span className="text-3xl font-black leading-none text-brand">{stepNumber}</span>
      <RichHtml
        html={item.title}
        as="h3"
        className="mt-2 text-xl font-bold text-brand [&_p]:mb-0"
      />
      <RichHtml
        html={item.description}
        className="mt-2 max-w-xs text-sm text-gray-600 [&_p]:mb-0"
      />
      {!isLast ? (
        <ArrowDown className="mt-8 h-6 w-6 animate-bounce text-gray-300" aria-hidden />
      ) : null}
    </div>
  );
}

export default function SeoSteps({
  steps,
  tone = "dark",
  layout = "cards",
}: {
  steps: Section;
  tone?: SectionTone;
  layout?: Layout;
}) {
  const t = useTranslations("singleService.seoSteps");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const hasImage = hasSectionImage(steps?.image);
  const displayItems = orderSectionItemsForDisplay(steps?.items);

  if (layout === "timeline") {
    return (
      <div className="container space-y-8">
        <SectionHeader
          titleHtml={steps?.title || undefined}
          title={t("title")}
          subtitleHtml={steps?.description || t("subtitle")}
          subtitleColor={sectionSubtitleColor(tone)}
        />
        <div className="relative z-10 mt-12 hidden min-h-[400px] items-center justify-between gap-4 lg:flex">
          {displayItems.map((item, index) => (
            <StepTimelineItem
              key={`${item.sort_order ?? index}-${index}`}
              item={item}
              index={index}
              isRTL={isRTL}
              isLast={index === displayItems.length - 1}
            />
          ))}
        </div>
        <div className="relative z-10 mt-12 flex flex-col gap-6 lg:hidden">
          {displayItems.map((item, index) => (
            <StepTimelineMobileItem
              key={`${item.sort_order ?? index}-${index}-mobile`}
              item={item}
              index={index}
              isLast={index === displayItems.length - 1}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-8">
      <SectionHeader
        titleHtml={steps?.title || undefined}
        title={t("title")}
        subtitleHtml={steps?.description || t("subtitle")}
        subtitleColor={sectionSubtitleColor(tone)}
      />
      <div
        className={cn(
          "flex items-center gap-8",
          !hasImage && "justify-center",
        )}
      >
        <div
          className={cn(
            "grid grid-cols-1 gap-4",
            hasImage ? "lg:grid-cols-2 flex-1" : "w-full max-w-4xl",
          )}
        >
          {displayItems.map((item: SectionItem, index: number) => (
            <ServiceSectionItemCard
              key={`${item.sort_order ?? index}-${index}`}
              link={item.link}
              icon={item.icon}
              className={sectionItemCardClassName(tone)}
            >
              <RichHtml html={item.title} as="p" className="font-bold" />
              <RichHtml
                html={item.description}
                className={cn(
                  "mt-2",
                  tone === "dark" ? "text-gray-200" : "text-gray-600",
                )}
              />
            </ServiceSectionItemCard>
          ))}
        </div>
        {hasImage && steps.image ? (
          <div className="shrink-0 max-lg:mx-auto max-lg:w-full max-lg:max-w-md">
            <Image
              src={steps.image}
              alt={steps.image_alt ?? ""}
              width={500}
              height={500}
              className="mask-blob h-auto w-auto max-w-full"
              unoptimized={isRemoteMediaUrl(steps.image)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
