"use client";

import SectionHeader from "@/features/shared/components/section-header";
import { isRemoteMediaUrl } from "@/features/blogs/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import Image from "next/image";

export type LogoTileItem = {
  url: string;
  alt?: string;
};

type Props = {
  title: string;
  subtitleHtml?: string;
  images: LogoTileItem[];
  className?: string;
  /** Section background — partners block uses white on about. */
  variant?: "default" | "white";
};

export default function LogoTilesSection({
  title,
  subtitleHtml,
  images,
  className,
  variant = "default",
}: Props) {
  if (!images.length) return null;

  return (
    <section
      className={cn(
        "py-16 md:py-20",
        variant === "white" ? "bg-white" : "bg-muted/20",
        className,
      )}
    >
      <div className="container max-w-6xl space-y-10">
        <SectionHeader
          title={title}
          subtitleHtml={subtitleHtml}
          subtitleColor="text-gray-500"
        />

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`}>
              <div className="group flex aspect-[4/3] items-center justify-center rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-brand hover:shadow-md md:p-5">
                <Image
                  src={image.url}
                  alt={image.alt ?? title}
                  width={160}
                  height={80}
                  unoptimized={isRemoteMediaUrl(image.url)}
                  className="max-h-14 w-full object-contain transition-transform duration-300 group-hover:scale-105 md:max-h-16"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
