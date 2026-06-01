import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { ServiceSectionItemCard } from "@/features/services/components/service-section-item-card";
import { hasSectionImage } from "@/features/services/lib/has-section-image";
import SectionHeader from "@/features/shared/components/section-header";
import { RichHtml } from "@/features/shared/components/rich-html";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { Section, SectionItem } from "../types";

export default function SeoSteps({ steps }: { steps: Section }) {
  const t = useTranslations("singleService.seoSteps");
  const hasImage = hasSectionImage(steps?.image);

  return (
    <div className="py-12 bg-gray-900">
      <div className="container space-y-8">
        <SectionHeader
          titleHtml={steps?.title || undefined}
          title={t("title")}
          subtitleHtml={steps?.description || t("subtitle")}
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
            {steps?.items?.map((item: SectionItem, index: number) => (
              <ServiceSectionItemCard
                key={`${item.sort_order ?? index}-${index}`}
                link={item.link}
                icon={item.icon}
                className="rounded-xl border border-brand bg-gray-700 p-4 text-white"
              >
                <RichHtml html={item.title} as="p" className="font-bold" />
                <RichHtml html={item.description} className="mt-2 text-gray-200" />
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
    </div>
  );
}
