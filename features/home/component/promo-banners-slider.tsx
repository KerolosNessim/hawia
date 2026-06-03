"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Link } from "@/i18n/navigation";
import { RichHtml } from "@/features/shared/components/rich-html";
import { cn } from "@/lib/utils";
import { plainTextFromHtml } from "@/lib/plain-text-from-html";
import Autoplay from "embla-carousel-autoplay";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Music2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { PromoBannerSlide } from "@/features/home/types/promo-banners";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export type { PromoBannerSlide } from "@/features/home/types/promo-banners";

const SLIDE_BG_CLASS = "bg-brand";

const PROMO_SLIDE_RICH =
  "promo-banner-rich max-w-xl [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:leading-tight [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-bold [&_p]:mb-2 [&_p:last-child]:mb-0";

const PROMO_SECTION_RICH =
  "promo-banner-rich [&_p]:mb-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-semibold";

function PromoRichField({
  html,
  className,
  as = "div",
}: {
  html?: string;
  className?: string;
  as?: "div" | "p" | "span";
}) {
  if (!html?.trim()) return null;
  return <RichHtml html={html} as={as} className={cn(PROMO_SLIDE_RICH, className)} />;
}

function PromoBannerIllustration() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md" aria-hidden>
      <div className="absolute inset-[8%] rounded-[2.5rem] border border-white/20 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-sm">
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white">
            A
          </div>
          <div className="grid w-full grid-cols-3 gap-2 text-center text-[10px] font-semibold text-white/80">
            <span className="rounded-lg bg-white/10 px-2 py-2">320</span>
            <span className="rounded-lg bg-white/10 px-2 py-2">8.5%</span>
            <span className="rounded-lg bg-white/10 px-2 py-2">12K</span>
          </div>
        </div>
      </div>

      <span className="absolute -start-2 top-[18%] flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
        <Camera className="size-5 text-white" />
      </span>
      <span className="absolute start-[8%] top-[4%] rounded-lg bg-black px-2.5 py-1.5 text-xs font-bold text-white">
        X
      </span>
      <span className="absolute end-[6%] top-[12%] flex size-11 items-center justify-center rounded-xl bg-yellow-400 text-lg font-bold text-white shadow-lg">
        S
      </span>
      <span className="absolute -end-1 bottom-[28%] flex size-10 items-center justify-center rounded-full bg-white/25 text-white">
        <Music2 className="size-4" />
      </span>
      <span className="absolute bottom-[12%] start-[4%] h-10 w-16 rounded-lg bg-white/15" />
      <span className="absolute bottom-[38%] end-0 max-w-[140px] rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1.5 text-[11px] font-medium text-emerald-100">
        +48
      </span>
    </div>
  );
}

function PromoBannerCtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const trimmed = href.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return (
      <a href={trimmed} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return (
    <Link href={path} className={className}>
      {children}
    </Link>
  );
}

function PromoBannerSlideCard({
  slide,
  isRtl,
}: {
  slide: PromoBannerSlide;
  isRtl: boolean;
}) {
  const useImage = Boolean(slide.image?.trim());

  return (
    <article
      data-promo-banner="slide"
      className={cn(
        "relative overflow-hidden rounded-3xl px-6 py-10 md:px-10 md:py-12 lg:px-14",
        slide.themeClass ?? SLIDE_BG_CLASS,
      )}
    >
      <div
        className="pointer-events-none absolute -end-20 -top-20 size-72 rounded-full bg-white/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -start-16 size-64 rounded-full bg-black/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className={cn("order-2 lg:order-1", isRtl && "lg:order-2")}>
          {useImage ? (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl">
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                className="object-contain object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={slide.image.startsWith("http")}
              />
            </div>
          ) : (
            <PromoBannerIllustration />
          )}
        </div>

        <div
          className={cn(
            "order-1 flex flex-col gap-5 text-start lg:order-2",
            isRtl && "lg:order-1",
          )}
        >
          {slide.badge ? (
            <span className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Smartphone className="size-3.5 shrink-0 text-white/90" aria-hidden />
              <PromoRichField
                html={slide.badge}
                as="span"
                className="text-xs font-semibold [&_p]:inline [&_p]:text-xs"
              />
            </span>
          ) : null}

          <div className="space-y-3">
            <PromoRichField
              html={slide.title}
              className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-[2.35rem]"
            />
            <PromoRichField
              html={slide.subtitle}
              className="text-lg font-bold md:text-xl [&_p]:text-lg md:[&_p]:text-xl"
            />
          </div>

          <PromoRichField
            html={slide.description}
            className="text-sm leading-relaxed md:text-base [&_p]:text-white/90"
          />

          {slide.buttonText && slide.buttonLink ? (
            <div>
              <PromoBannerCtaLink
                href={slide.buttonLink}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-gray-900 shadow-lg shadow-black/15 transition-transform hover:scale-[1.02] hover:bg-white/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <RichHtml
                  html={slide.buttonText}
                  as="span"
                  className="cms-rich-html text-sm font-bold text-gray-900 [&_p]:mb-0 [&_p]:inline [&_*]:!text-gray-900"
                />
                {isRtl ? (
                  <ChevronLeft className="size-4 shrink-0" aria-hidden />
                ) : (
                  <ChevronRight className="size-4 shrink-0" aria-hidden />
                )}
              </PromoBannerCtaLink>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export type PromoBannersSliderProps = {
  sectionLabel: string;
  sectionEyebrow?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  slides: PromoBannerSlide[];
};

export default function PromoBannersSlider({
  sectionLabel,
  sectionEyebrow = "",
  sectionTitle = "",
  sectionSubtitle = "",
  slides,
}: PromoBannersSliderProps) {
  const t = useTranslations("homePromoBanners");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const showSectionHeader = [sectionEyebrow, sectionTitle, sectionSubtitle].some((text) =>
    Boolean(plainTextFromHtml(text).trim()),
  );

  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setActiveIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (!slides.length) return null;

  return (
    <section className="bg-gray-50 py-16 md:py-20" aria-label={sectionLabel}>
      <div className="container max-w-6xl space-y-8">
        {showSectionHeader ? (
          <div className="flex flex-col gap-2 text-center md:text-start">
            {sectionEyebrow ? (
              <span className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-brand md:justify-start">
                <Sparkles className="size-4 shrink-0" aria-hidden />
                <RichHtml
                  html={sectionEyebrow}
                  as="span"
                  className={cn(PROMO_SECTION_RICH, "text-sm font-semibold text-brand [&_*]:!text-brand")}
                />
              </span>
            ) : null}
            {sectionTitle ? (
              <RichHtml
                html={sectionTitle}
                className={cn(
                  PROMO_SECTION_RICH,
                  "text-2xl font-bold text-gray-900 md:text-3xl [&_*]:!text-gray-900",
                )}
              />
            ) : null}
            {sectionSubtitle ? (
              <RichHtml
                html={sectionSubtitle}
                className={cn(
                  PROMO_SECTION_RICH,
                  "max-w-2xl text-muted-foreground [&_*]:!text-muted-foreground",
                )}
              />
            ) : null}
          </div>
        ) : null}

        <div dir={isRtl ? "rtl" : "ltr"}>
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: slides.length > 1,
              direction: isRtl ? "rtl" : "ltr",
            }}
            plugins={
              slides.length > 1
                ? [Autoplay({ delay: 6000, stopOnInteraction: true })]
                : undefined
            }
            className="w-full"
          >
            <CarouselContent className="-ms-0">
              {slides.map((slide) => (
                <CarouselItem key={slide.id} className="basis-full ps-0">
                  <PromoBannerSlideCard slide={slide} isRtl={isRtl} />
                </CarouselItem>
              ))}
            </CarouselContent>

            {slides.length > 1 ? (
              <>
                <CarouselPrevious
                  isRtl={isRtl}
                  className="max-md:hidden -inset-s-4 size-11 border-brand/30 bg-white/90 text-gray-900 shadow-md hover:bg-white"
                />
                <CarouselNext
                  isRtl={isRtl}
                  className="max-md:hidden -inset-e-4 size-11 border-brand/30 bg-white/90 text-gray-900 shadow-md hover:bg-white"
                />
              </>
            ) : null}
          </Carousel>

          {slides.length > 1 ? (
            <div className="mt-6 flex justify-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={t("goToSlide", { index: index + 1 })}
                  aria-current={activeIndex === index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    activeIndex === index
                      ? "w-8 bg-brand"
                      : "w-2.5 bg-brand/35 hover:bg-brand/55",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
