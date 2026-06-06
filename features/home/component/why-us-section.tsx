"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  Handshake,
  Loader2,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { WhyUsFeatureItem } from "@/features/home/component/why-us-card";
import { useWhyUs } from "../hooks/useWhyUs";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import * as motion from "framer-motion/client";
import { RichHtml } from "@/features/shared/components/rich-html";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import {
  mapGalleryImages,
  pickWhyUsGalleryFromSection,
  resolveWhyUsCoverUrl,
  resolveWhyUsFeatureImageUrl,
} from "../lib/why-us-images";
import { pickImageAlt } from "@/lib/image-alt";
import { cn } from "@/lib/utils";
import { getLenisInstance } from "@/lib/lenis/scroll";

const featureIcons = [Handshake, Users, TrendingUp, Star, Users];
const FALLBACK_ILLUSTRATION = "/values.webp";
const FEATURES_PAGE_SIZE = 4;

const whyUsCtaBtnClass =
  "h-auto min-h-11 inline-flex w-auto justify-center gap-2 rounded-full bg-brand px-8 py-3.5 text-base font-medium text-white shadow-none hover:bg-brand/90";

export default function WhyUsSection({ countryId }: { countryId?: number }) {
  const t = useTranslations("why-choose-us");
  const locale = useLocale();
  const { data, isLoading } = useWhyUs(countryId);
  const [visibleCount, setVisibleCount] = useState(FEATURES_PAGE_SIZE);

  const section = data?.data;
  const items = Array.isArray(section?.items) ? section.items : [];

  type WhyUsFeature = {
    title: string;
    description: string;
    image?: string;
    imageAlt?: string;
  };

  const apiFeatures: WhyUsFeature[] = items.map((item) => ({
    title: item.content.title,
    description: item.content.description,
    image: resolveWhyUsFeatureImageUrl(item.media, locale) ?? undefined,
    imageAlt: pickImageAlt(item.media?.image_alt, locale) || undefined,
  }));

  const rawFeatures = t.raw("features");
  const fallbackFeatures: WhyUsFeature[] = Array.isArray(rawFeatures)
    ? (rawFeatures as WhyUsFeature[])
    : [];

  const features =
    apiFeatures.length > 0
      ? apiFeatures
      : countryId == null
        ? fallbackFeatures
        : [];

  useEffect(() => {
    setVisibleCount(FEATURES_PAGE_SIZE);
  }, [features.length, countryId]);

  const visibleFeatures = useMemo(
    () => features.slice(0, visibleCount),
    [features, visibleCount],
  );

  const hasMoreFeatures = visibleCount < features.length;

  const title = section?.content?.title || t("title");
  const description = section?.content?.description || t("description");

  const coverUrl =
    resolveWhyUsCoverUrl(
      section?.media?.image,
      locale,
      section?.media?.images,
    ) ?? null;

  const galleryImages = mapGalleryImages(
    pickWhyUsGalleryFromSection(section),
    locale,
    typeof title === "string" ? title : undefined,
  );

  const coverAlt =
    pickImageAlt(
      section?.media?.image_alt,
      locale,
      typeof title === "string" ? title : "",
    ) || (typeof title === "string" ? title : "");

  const illustrationSrc = coverUrl ?? FALLBACK_ILLUSTRATION;
  const useRemoteCover = isRemoteMediaUrl(illustrationSrc);

  return (
    <section
      data-home-section="why-choose-us"
      className=" relative w-full   pb-16   text-gray-900 finger-print-background"
    >
      <div className="container relative mx-auto min-w-0 px-5 sm:px-6 md:px-8 lg:px-10">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-brand" />
          </div>
        ) : (
          <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-x-14 xl:gap-x-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="min-w-0 flex-1 space-y-6 text-start sm:space-y-8"
            >
              <div className="space-y-4">
                {typeof title === "string" && title.includes("<") ? (
                  <RichHtml
                    html={title}
                    className="cms-rich-html text-2xl font-bold leading-tight  sm:text-3xl lg:text-[2rem] lg:leading-tight [&_*]:!text-inherit [&_h1]:!text-brand [&_h2]:!text-brand [&_h3]:!text-brand [&_p]:mb-0"
                  />
                ) : (
                  <h2 className="text-2xl font-bold leading-tight  sm:text-3xl lg:text-[2rem]">
                    {title}
                  </h2>
                )}
                <RichHtml
                  html={description}
                  className="cms-rich-html text-base leading-relaxed  sm:text-lg [&_*]:!text-inherit [&_a]:!text-brand [&_p:last-child]:mb-0 [&_p]:mb-3"
                />
              </div>

              <ul className="flex flex-col gap-3 sm:gap-4">
                {visibleFeatures.map((feature, i) => (
                  <WhyUsFeatureItem
                    key={`${feature.title}-${i}`}
                    title={feature.title}
                    description={feature.description}
                    image={feature.image}
                    imageAlt={feature.imageAlt}
                    icon={featureIcons[i % featureIcons.length]}
                  />
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {hasMoreFeatures ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setVisibleCount((count) =>
                        Math.min(count + FEATURES_PAGE_SIZE, features.length),
                      );
                      requestAnimationFrame(() => getLenisInstance()?.resize());
                    }}
                    className="h-12 rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white hover:border-brand hover:bg-brand/90 hover:text-white"
                  >
                    {t("showMore")}
                  </Button>
                ) : null}

                <Link href="/about" className="inline-flex h-12" >
                  <Button className={whyUsCtaBtnClass}>
                    <ArrowRight
                      className="size-4 shrink-0 rtl:rotate-180"
                      aria-hidden
                    />
                    {t("about")}
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Stretch column + sticky inner — items-stretch on grid gives this cell full row height */}
            <div className="relative w-full lg:w-[min(100%,28rem)] lg:shrink-0 xl:w-[min(100%,32rem)]">
              <div className="lg:sticky lg:top-28 lg:z-10 lg:w-full">
                <div className="flex flex-col items-center justify-center gap-6 px-2 sm:px-4">
                  <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px] xl:max-w-[420px]">
                    <div
                      className="absolute inset-[8%] rounded-full bg-gray-800 shadow-[0_0_80px_rgba(163,205,57,0.12)]"
                      aria-hidden
                    />
                    <Image
                      src={illustrationSrc}
                      alt={coverAlt}
                      width={480}
                      height={480}
                      unoptimized={useRemoteCover}
                      className="relative z-10 size-full object-contain p-4"
                      priority={false}
                    />
                  </div>

                  {galleryImages.length > 0 ? (
                    <div
                      className={cn(
                        "grid w-full max-w-[420px] gap-3",
                        galleryImages.length >= 4
                          ? "grid-cols-2 sm:grid-cols-4"
                          : "grid-cols-3 sm:grid-cols-4",
                      )}
                    >
                      {galleryImages.map((img) => (
                        <div
                          key={img.id}
                          className="flex aspect-square items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2"
                        >
                          <Image
                            src={img.url}
                            alt={img.alt}
                            width={96}
                            height={96}
                            unoptimized={isRemoteMediaUrl(img.url)}
                            className="size-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
