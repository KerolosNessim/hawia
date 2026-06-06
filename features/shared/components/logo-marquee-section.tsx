"use client";

import SectionHeader from "@/features/shared/components/section-header";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import type { LogoTileItem } from "@/features/shared/components/logo-tiles-section";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import Image from "next/image";
import Marquee from "react-fast-marquee";

type Props = {
  title: string;
  subtitleHtml?: string;
  images: LogoTileItem[];
  className?: string;
  variant?: "default" | "white";
  rowCount?: number;
};

export default function LogoMarqueeSection({
  title,
  subtitleHtml,
  images,
  className,
  variant = "white",
  rowCount = 3,
}: Props) {
  const locale = useLocale();

  if (!images.length) return null;

  const partnerRows = Array.from({ length: rowCount }, () => [] as LogoTileItem[]);
  images.forEach((image, index) => {
    partnerRows[index % rowCount].push(image);
  });

  const fadeFrom = variant === "white" ? "from-white" : "from-muted/20";

  const card = (image: LogoTileItem, key: string) => (
    <div
      key={key}
      className="group relative mx-2 flex h-32 w-44 shrink-0 items-center justify-center rounded-2xl border border-neutral-200/60 bg-neutral-50/40 p-8 transition-all duration-300 hover:border-brand hover:shadow-md"
    >
      <Image
        src={image.url}
        alt={image.alt ?? title}
        width={180}
        height={80}
        unoptimized={isRemoteMediaUrl(image.url)}
        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );

  return (
    <section
      className={cn(
        "space-y-8 overflow-hidden py-16",
        variant === "white" ? "bg-white" : "bg-muted/20",
        className,
      )}
    >
      <div className="container max-w-6xl space-y-8">
        <SectionHeader
          title={title}
          subtitleHtml={subtitleHtml}
          subtitleColor="text-gray-500"
        />

      </div>
        <div dir="ltr" className="relative max-w-full space-y-6 overflow-x-hidden">
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-linear-to-r to-transparent",
              fadeFrom,
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-linear-to-l to-transparent",
              fadeFrom,
            )}
          />

          {partnerRows.map((rowImages, rowIndex) => {
            if (!rowImages.length) return null;

            const isReverse = rowIndex % 2 === 1;
            const direction =
              locale === "ar"
                ? isReverse
                  ? "left"
                  : "right"
                : isReverse
                  ? "right"
                  : "left";

            return (
              <div key={rowIndex} className="max-w-full overflow-hidden">
                <Marquee direction={direction} speed={50} pauseOnHover autoFill>
                  {rowImages.map((image, index) =>
                    card(image, `r${rowIndex}-${image.url}-${index}`),
                  )}
                </Marquee>
              </div>
            );
          })}
        </div>
    </section>
  );
}
