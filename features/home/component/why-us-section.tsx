"use client";

import React from "react";
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

const featureIcons = [Handshake, Users, TrendingUp, Star, Users];

const FALLBACK_ILLUSTRATION = "/values.webp";

export default function WhyUsSection() {
  const t = useTranslations("why-choose-us");
  const locale = useLocale();
  const { data, isLoading } = useWhyUs();

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

  const features = apiFeatures.length > 0 ? apiFeatures : fallbackFeatures;

  const title = section?.content?.title || t("title");
  const description = section?.content?.description || t("description");

  const coverUrl =
    resolveWhyUsCoverUrl(section?.media?.image, locale, section?.media?.images) ??
    null;

  const galleryImages = mapGalleryImages(
    pickWhyUsGalleryFromSection(section),
    locale,
    typeof title === "string" ? title : undefined,
  );

  const coverAlt =
    pickImageAlt(section?.media?.image_alt, locale, typeof title === "string" ? title : "") ||
    (typeof title === "string" ? title : "");

  const illustrationSrc = coverUrl ?? FALLBACK_ILLUSTRATION;
  const useRemoteCover = isRemoteMediaUrl(illustrationSrc);

  return (
    <section className="relative bg-white py-16 md:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] text-gray-400"
        aria-hidden
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="why-us-wavy"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 50 Q 25 25, 50 50 T 100 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#why-us-wavy)" />
        </svg>
      </div>

      <div className="container relative mx-auto min-w-0 px-5 sm:px-6 md:px-8 lg:px-10">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-brand" />
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-x-14 lg:gap-y-10 xl:gap-x-20">
            {/* Content first — follows document / reading order (start side per locale) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="min-w-0 space-y-6 text-start sm:space-y-8 lg:pb-4"
            >
              <div className="space-y-4">
                {typeof title === "string" && title.includes("<") ? (
                  <RichHtml
                    html={title}
                    className="cms-rich-html text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-[2rem] lg:leading-tight [&_h2]:text-inherit [&_p]:mb-0"
                  />
                ) : (
                  <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-[2rem]">
                    {title}
                  </h2>
                )}
                <RichHtml
                  html={description}
                  className="cms-rich-html text-base leading-relaxed text-gray-600 sm:text-lg [&_p:last-child]:mb-0 [&_p]:mb-3"
                />
              </div>

              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <WhyUsFeatureItem
                    key={i}
                    title={feature.title}
                    description={feature.description}
                    image={feature.image}
                    imageAlt={feature.imageAlt}
                    icon={featureIcons[i % featureIcons.length]}
                  />
                ))}
              </ul>

              <Link href="/about" className="inline-flex">
                <Button className="rounded-full bg-brand px-6 py-3 text-base text-white hover:bg-brand/90">
                  {t("about")}
                  <ArrowRight className="size-4 rtl:rotate-y-180" />
                </Button>
              </Link>
            </motion.div>

            {/*
              Sticky must live on a plain element — Framer Motion `transform` on the same
              node breaks position:sticky. Stays visible while scrolling the feature list.
            */}
            <div className="w-full md:sticky md:top-28 md:z-10 md:self-start md:max-h-[calc(100dvh-7.5rem)] md:overflow-y-auto md:overscroll-contain">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center gap-6 px-2 sm:px-4"
              >
                <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[380px] xl:max-w-[420px]">
                  <div
                    className="absolute inset-[10%] rounded-full bg-gray-100"
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
                  <div className="grid w-full max-w-[420px] grid-cols-3 gap-3 sm:grid-cols-4">
                    {galleryImages.map((img) => (
                      <div
                        key={img.id}
                        className="flex aspect-square items-center justify-center rounded-xl border border-gray-100 bg-gray-50/80 p-2"
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
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
